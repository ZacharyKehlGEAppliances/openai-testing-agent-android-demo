import { Page } from "playwright";
import logger from "../utils/logger";
import { computerUseLoop } from "../lib/computer-use-loop";
import { Socket } from "socket.io";
import TestScriptReviewAgent from "../agents/test-script-review-agent";
import { setupCUAModel } from "../services/openai-cua-client";
import { LoginService } from "../services/login-service";
import { ModelInput } from "../services/openai-cua-client";
import { MobileDeviceManager } from "../services/mobile-device-manager";

export async function mobileCuaLoopHandler(
  systemPrompt: string,
  url: string,
  socket: Socket,
  testCaseReviewAgent: TestScriptReviewAgent,
  username: string,
  password: string,
  loginRequired: boolean,
  deviceName: string,
  userInfo?: string
) {
  logger.info(`Starting mobile test script execution on ${deviceName}...`);
  socket.emit("message", `Starting mobile test script execution on ${deviceName}...`);

  const deviceManager = new MobileDeviceManager();

  try {
    const { browser, context } = await deviceManager.launchMobileDevice(deviceName);
    const page = await context.newPage();

    // Set the page as data in the socket
    socket.data.page = page;
    socket.data.deviceName = deviceName;
    socket.data.deviceManager = deviceManager;

    logger.debug(`Mobile browser launched for ${deviceName}...`);
    socket.emit("message", `Mobile browser launched for ${deviceName}...`);

    // Navigate to the provided URL
    await page.goto(url);
    await page.waitForTimeout(3000);

    // Capture an initial screenshot
    const screenshot_before_login = await page.screenshot({ fullPage: true });
    const screenshot_before_login_base64 = screenshot_before_login.toString("base64");

    // Asynchronously check the status of the test script
    const testScriptReviewResponsePromise = testCaseReviewAgent.checkTestScriptStatus(
      screenshot_before_login_base64,
      `Mobile device: ${deviceName}`
    );

    testScriptReviewResponsePromise.then((testScriptReviewResponse) => {
      logger.debug("Sending mobile screenshot before login to Test Script Review Agent");
      socket.emit("testscriptupdate", testScriptReviewResponse);
      logger.trace(`Initial mobile test script state emitted: ${JSON.stringify(testScriptReviewResponse, null, 2)}`);
    });

    await page.waitForTimeout(2000);

    let modelInput: ModelInput;

    if (loginRequired) {
      logger.debug("Login required for mobile device... proceeding with login.");
      socket.emit("message", "Login required for mobile device... proceeding with login.");

      const loginService = new LoginService();
      await loginService.fillin_login_credentials(username, password, page);

      logger.trace("Mobile login execution completed... proceeding with test script execution.");
      await page.waitForTimeout(5000);

      const screenshot_after_login = await page.screenshot({ fullPage: true });
      const screenshot_after_login_base64 = screenshot_after_login.toString("base64");

      const testScriptReviewResponsePromise_after_login = testCaseReviewAgent.checkTestScriptStatus(
        screenshot_after_login_base64,
        `Mobile device: ${deviceName} - After login`
      );

      testScriptReviewResponsePromise_after_login.then((testScriptReviewResponse) => {
        logger.debug("Sending mobile screenshot after login to Test Script Review Agent");
        socket.emit("testscriptupdate", testScriptReviewResponse);
        logger.trace(`Mobile test script state emitted after login: ${JSON.stringify(testScriptReviewResponse, null, 2)}`);
      });

      await loginService.click_login_button(page);

      socket.emit("message", "Mobile login step executed... proceeding with test script execution.");

      modelInput = {
        screenshotBase64: screenshot_after_login_base64,
        previousResponseId: undefined,
        lastCallId: undefined,
      };
    } else {
      modelInput = {
        screenshotBase64: screenshot_before_login_base64,
        previousResponseId: undefined,
        lastCallId: undefined,
      };
    }

    // Start with an initial call
    const userInfoStr = userInfo ?? "";
    const mobileSystemPrompt = `${systemPrompt}\n\nIMPORTANT: You are testing on a mobile device (${deviceName}). Use mobile-appropriate interactions like tap, swipe, and scroll. Consider mobile UI patterns and responsive design.`;
    
    let initial_response = await setupCUAModel(mobileSystemPrompt, userInfoStr);

    logger.debug(`Initial response from mobile CUA model: ${JSON.stringify(initial_response, null, 2)}`);
    logger.debug(`Starting mobile computer use loop...`);

    const response = await computerUseLoop(
      page,
      initial_response,
      testCaseReviewAgent,
      socket
    );

    const messageResponse = response.output.filter((item: any) => item.type === "message");

    if (messageResponse.length > 0) {
      messageResponse.forEach((message: any) => {
        if (Array.isArray(message.content)) {
          message.content.forEach((contentBlock: any) => {
            if (contentBlock.type === "output_text" && contentBlock.text) {
              socket.emit("message", contentBlock.text);
            }
          });
        }
      });
    }
  } catch (error) {
    logger.error(`Error during mobile playwright loop: ${error}`);
    socket.emit("message", `Error during mobile test execution: ${error}`);
  } finally {
    await deviceManager.cleanup();
  }
}
