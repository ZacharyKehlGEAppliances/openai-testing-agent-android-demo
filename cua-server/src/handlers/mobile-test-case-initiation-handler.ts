import { Socket } from "socket.io";
import logger from "../utils/logger";
import TestCaseAgent from "../agents/test-case-agent";
import { convertTestCaseToSteps, TestCase } from "../utils/testCaseUtils";
import { mobileCuaLoopHandler } from "./mobile-cua-loop-handler";
import TestScriptReviewAgent from "../agents/test-script-review-agent";
import { MobileDeviceManager } from "../services/mobile-device-manager";

export async function handleMobileTestCaseInitiated(
  socket: Socket,
  data: any
): Promise<void> {
  logger.debug(`Received mobile testCaseInitiated with data: ${JSON.stringify(data)}`);
  
  try {
    const { testCase, url, userName, password, userInfo, deviceName } = data as {
      testCase: string;
      url: string;
      userName: string;
      password: string;
      userInfo: string;
      deviceName: string;
      loginRequired?: boolean;
    };
    
    const loginRequired = data.loginRequired ?? true;

    // Validate device
    const deviceManager = new MobileDeviceManager();
    const availableDevices = deviceManager.getAvailableDevices();
    
    if (!availableDevices.includes(deviceName)) {
      socket.emit("message", `Error: Device "${deviceName}" not supported. Available devices: ${availableDevices.join(", ")}`);
      return;
    }

    const deviceInfo = deviceManager.getDeviceInfo(deviceName);
    logger.debug(`Mobile device selected: ${deviceName} (${deviceInfo?.platform})`);

    socket.emit("message", `Mobile test case received for ${deviceName} - creating test script...`);

    const msg = `${testCase} URL: ${url} User Name: ${userName} Password: *********\n USER INFO:\n${userInfo}\n DEVICE: ${deviceName} (${deviceInfo?.platform})`;

    const testCaseAgent = new TestCaseAgent(loginRequired);
    const testCaseResponse = await testCaseAgent.invokeResponseAPI(msg);
    const testCaseJson = JSON.stringify(testCaseResponse);

    const testCaseReviewAgent = new TestScriptReviewAgent();

    logger.debug("Invoking mobile test script review agent - This should only be called once per test script run.");

    let testScriptReviewResponse = await testCaseReviewAgent.instantiateAgent(
      `MOBILE TESTING INSTRUCTIONS:\n${testCaseJson}\nDevice: ${deviceName} (${deviceInfo?.platform})`
    );
    
    logger.trace(`Mobile test script state initialized: ${JSON.stringify(testScriptReviewResponse, null, 2)}`);

    socket.emit("message", `Mobile test script review agent initialized for ${deviceName}.`);
    socket.data.testCaseReviewAgent = testCaseReviewAgent;

    logger.debug(`Mobile test case cleaned: ${testCaseJson}`);

    socket.emit("testcases", testCaseJson);
    socket.emit("message", `Mobile task steps created for ${deviceName}.`);

    const testScript = convertTestCaseToSteps(testCaseResponse as TestCase);
    logger.debug(`Mobile test script: ${testScript}`);

    await mobileCuaLoopHandler(
      testScript,
      url,
      socket,
      testCaseReviewAgent,
      userName,
      password,
      loginRequired,
      deviceName,
      userInfo
    );
  } catch (error) {
    logger.error(`Error in handleMobileTestCaseInitiated: ${error}`);
    socket.emit("message", `Error initiating mobile test case: ${error}`);
  }
}
