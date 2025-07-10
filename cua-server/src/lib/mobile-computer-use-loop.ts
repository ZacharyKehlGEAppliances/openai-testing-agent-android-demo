import { Page } from "playwright";
import {
  sendInputToModel,
  sendFunctionCallOutput,
} from "../services/openai-cua-client";
import { handleMobileAction } from "../handlers/mobile-action-handler";
import logger from "../utils/logger";
import { Socket } from "socket.io";
import TestScriptReviewAgent from "../agents/test-script-review-agent";
import { MOBILE_DEVICES } from "../services/mobile-device-manager";

export async function mobileComputerUseLoop(
  page: Page,
  response: any,
  testCaseReviewAgent: TestScriptReviewAgent,
  socket: Socket,
  deviceName: string
) {
  const device = MOBILE_DEVICES[deviceName];
  if (!device) {
    throw new Error(`Unknown device: ${deviceName}`);
  }

  await page.screenshot({ path: "mobile-screenshot.png", fullPage: true });

  while (true) {
    if (socket.data.testCaseStatus === "fail") {
      logger.debug("Mobile test case failed. Exiting the computer use loop.");
      return response;
    }

    if (socket.data.testCaseStatus === "pass") {
      logger.debug("Mobile test case passed. Exiting the computer use loop.");
      return response;
    }

    const computerCalls = response.output.filter((item: any) => item.type === "computer_call");
    const functionCalls = response.output.filter((item: any) => item.type === "function_call");

    // Handle function calls first
    if (functionCalls.length > 0) {
      for (const funcCall of functionCalls) {
        if (funcCall.name === "mark_done") {
          response = await sendFunctionCallOutput(
            funcCall.call_id,
            response.id,
            { status: "done" }
          );
          socket.emit("message", "✅ Mobile test case finished.");
          socket.data.testCaseStatus = "pass";
          await page.context().browser()?.close();
          return response;
        }
      }
    }

    socket.data.previousResponseId = response.id;

    if (computerCalls.length === 0) {
      logger.debug("No computer call found in mobile response. Final output from model:");
      response.output.forEach((item: any) => {
        logger.debug(`Mobile output from the model - ${JSON.stringify(item, null, 2)}`);
      });

      const messageResponse = response.output.filter((item: any) => item.type === "message");

      if (messageResponse.length > 0) {
        logger.debug("Mobile response is a message. Trying to get answer from CUA Control Agent.");
        const message = messageResponse[0].content[0].text;
        logger.debug(`Mobile message from the CUA model: ${message}`);

        if (!message.call_id) {
          logger.debug("No call id found in mobile message. Exiting the computer use loop.");
        }

        response = await sendInputToModel(
          {
            screenshotBase64: "",
            previousResponseId: response.id,
            lastCallId: message.call_id,
          },
          "continue"
        );
      } else {
        logger.debug("Mobile response is neither a computer_call nor a message. Returning the response.");
        return response;
      }
    } else {
      const reasoningOutputs = response.output.filter((item: any) => item.type === "reasoning");
      if (reasoningOutputs.length > 0) {
        reasoningOutputs.forEach((reason: any) => {
          const summaryText = Array.isArray(reason.summary)
            ? reason.summary.map((s: any) => s.text).join(" ")
            : "No reasoning provided";
          socket.emit("message", `📱 ${summaryText}`);
          logger.debug(`Mobile model reasoning: ${summaryText}`);
        });
      }

      const computerCall = computerCalls[0];

      if (computerCall.pending_safety_checks && computerCall.pending_safety_checks.length > 0) {
        const safetyCheck = computerCall.pending_safety_checks[0];
        logger.error(`Mobile safety check detected: ${safetyCheck.message}`);
        socket.emit("message", `Mobile safety check detected: ${safetyCheck.message}`);
        socket.emit("message", "Mobile test case failed. Exiting the computer use loop.");
        socket.data.testCaseStatus = "fail";
        return response;
      }

      const lastCallId = computerCall.call_id;
      socket.data.lastCallId = lastCallId;

      const action = computerCall.action;

      // Take a screenshot before certain actions
      if (["tap", "swipe", "long_press"].includes(action?.type)) {
        const screenshotBuffer = await page.screenshot({ fullPage: true });
        const screenshotBase64 = screenshotBuffer.toString("base64");

        const testScriptReviewResponsePromise = testCaseReviewAgent.checkTestScriptStatus(
          screenshotBase64,
          `Mobile device: ${deviceName} - Before ${action.type}`
        );

        testScriptReviewResponsePromise
          .then((testScriptReviewResponse) => {
            socket.emit("testscriptupdate", testScriptReviewResponse);
          })
          .catch((error) => {
            logger.error("Error during mobile test script review: " + error);
            socket.emit("testscriptupdate", { error: "Mobile review processing failed." });
          });
      }

      // Execute the mobile action
      await handleMobileAction(page, action);

      // Allow time for UI changes
      await page.waitForTimeout(1500);

      // Handle potential new tabs (mobile browsers)
      const pages = page.context().pages();
      if (pages.length > 1) {
        const newPage = pages[pages.length - 1];
        logger.debug("New mobile tab detected. Switching context to the new tab.");

        await newPage.setViewportSize(device.viewport);

        const screenshotBuffer = await newPage.screenshot({ fullPage: true });
        const screenshotBase64 = screenshotBuffer.toString("base64");

        response = await sendInputToModel({
          screenshotBase64,
          previousResponseId: response.id,
          lastCallId,
        });

        logger.info("Recursively calling mobile computerUseLoop with new page context.");
        response = await mobileComputerUseLoop(
          newPage,
          response,
          testCaseReviewAgent,
          socket,
          deviceName
        );

        return response;
      }

      let screenshotBuffer, screenshotBase64;

      logger.trace("Capturing updated mobile screenshot...");
      screenshotBuffer = await getMobileScreenshotWithRetry(page);
      screenshotBase64 = screenshotBuffer.toString("base64");

      response = await sendInputToModel({
        screenshotBase64,
        previousResponseId: response.id,
        lastCallId,
      });
    }
  }
}

async function getMobileScreenshotWithRetry(page: Page, retries = 3): Promise<Buffer> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const screenshot = await page.screenshot({ fullPage: true });
      return screenshot;
    } catch (error) {
      logger.error(`Mobile screenshot attempt ${attempt} failed: ${error}`);
      if (attempt === retries) {
        throw error;
      }
      await page.waitForTimeout(2000);
    }
  }
  throw new Error("Failed to capture mobile screenshot after retries");
}
