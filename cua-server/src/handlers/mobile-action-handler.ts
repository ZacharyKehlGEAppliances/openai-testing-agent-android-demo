import { Page } from "playwright";
import logger from "../utils/logger";

export async function handleMobileAction(page: Page, action: any): Promise<void> {
  logger.trace(`Handling mobile action: ${JSON.stringify(action)}`);
  const actionType = action.type;
  
  try {
    switch (actionType) {
      case "tap": {
        const { x, y } = action;
        logger.trace(`Mobile action: tap at (${x}, ${y})`);
        await page.touchscreen.tap(x, y);
        break;
      }
      case "double_tap": {
        const { x, y } = action;
        logger.trace(`Mobile action: double tap at (${x}, ${y})`);
        await page.touchscreen.tap(x, y);
        await page.waitForTimeout(100);
        await page.touchscreen.tap(x, y);
        break;
      }
      case "long_press": {
        const { x, y, duration = 1000 } = action;
        logger.trace(`Mobile action: long press at (${x}, ${y}) for ${duration}ms`);
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.waitForTimeout(duration);
        await page.mouse.up();
        break;
      }
      case "swipe": {
        const { startX, startY, endX, endY, duration = 300 } = action;
        logger.trace(`Mobile action: swipe from (${startX}, ${startY}) to (${endX}, ${endY})`);
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 10 });
        await page.mouse.up();
        break;
      }
      case "pinch": {
        const { centerX, centerY, scale } = action;
        logger.trace(`Mobile action: pinch at (${centerX}, ${centerY}) with scale ${scale}`);
        // Simulate pinch gesture
        const startDistance = 100;
        const endDistance = startDistance * scale;
        const deltaDistance = endDistance - startDistance;
        
        const point1StartX = centerX - startDistance / 2;
        const point1StartY = centerY;
        const point2StartX = centerX + startDistance / 2;
        const point2StartY = centerY;
        
        const point1EndX = centerX - endDistance / 2;
        const point1EndY = centerY;
        const point2EndX = centerX + endDistance / 2;
        const point2EndY = centerY;
        
        await page.mouse.move(point1StartX, point1StartY);
        await page.mouse.down();
        await page.mouse.move(point2StartX, point2StartY);
        await page.mouse.down({ button: 'right' });
        
        await page.mouse.move(point1EndX, point1EndY);
        await page.mouse.move(point2EndX, point2EndY);
        
        await page.mouse.up();
        await page.mouse.up({ button: 'right' });
        break;
      }
      case "scroll": {
        const { x, y, deltaX = 0, deltaY = 0 } = action;
        logger.trace(`Mobile action: scroll at (${x}, ${y}) with delta (${deltaX}, ${deltaY})`);
        await page.mouse.move(x, y);
        await page.mouse.wheel(deltaX, deltaY);
        break;
      }
      case "type": {
        const { text } = action;
        logger.trace(`Mobile action: type text '${text}'`);
        await page.keyboard.type(text);
        break;
      }
      case "key": {
        const { key } = action;
        logger.trace(`Mobile action: press key '${key}'`);
        await page.keyboard.press(key);
        break;
      }
      case "focus": {
        const { selector } = action;
        logger.trace(`Mobile action: focus on '${selector}'`);
        await page.focus(selector);
        break;
      }
      case "wait": {
        const { duration = 2000 } = action;
        logger.trace(`Mobile action: wait for ${duration}ms`);
        await page.waitForTimeout(duration);
        break;
      }
      case "screenshot": {
        logger.trace(`Mobile action: screenshot`);
        // Screenshot is handled separately in the main loop
        return;
      }
      case "rotate": {
        const { orientation } = action;
        logger.trace(`Mobile action: rotate to ${orientation}`);
        if (orientation === 'landscape') {
          await page.setViewportSize({ width: 852, height: 393 });
        } else {
          await page.setViewportSize({ width: 393, height: 852 });
        }
        break;
      }
      default:
        logger.error(`Unrecognized mobile action: ${JSON.stringify(action)}`);
    }
  } catch (error) {
    logger.error(`Error handling mobile action: ${JSON.stringify(action)}, error: ${error}`);
  }
}
