import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

import { handleTestCaseInitiated } from "./handlers/test-case-initiation-handler";
import { handleMobileTestCaseInitiated } from "./handlers/mobile-test-case-initiation-handler";
import { handleSocketMessage } from "./handlers/user-messages-handler";
import { testCaseUpdateHandler } from "./handlers/test-case-update-handler";
import logger from "./utils/logger";
import { MobileDeviceManager } from "./services/mobile-device-manager";

// Configuration
const PORT = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT, 10) : 8000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Create an HTTP server
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Mobile-enabled Socket.IO server is running.");
});

// Attach Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
  },
});

// Initialize mobile device manager
const globalDeviceManager = new MobileDeviceManager();

io.on("connection", (socket: Socket) => {
  logger.info(`New client connected: ${socket.id}`);

  // Initialize socket data
  socket.data = {
    testCaseReviewAgent: undefined,
    lastCallId: undefined,
    previousResponseId: undefined,
    testCaseStatus: "pending",
    deviceManager: undefined,
    page: undefined,
    deviceName: undefined,
    isMobile: false,
  };

  // Log all events for debugging
  socket.onAny((event, msg) => {
    logger.trace(`Received event: ${event} with message: ${JSON.stringify(msg)}`);
  });

  // Get available mobile devices
  socket.on("getMobileDevices", () => {
    try {
      const devices = globalDeviceManager.getAvailableDevices().map(name => {
        const info = globalDeviceManager.getDeviceInfo(name);
        return {
          name,
          platform: info?.platform || "unknown",
          viewport: info?.viewport || { width: 360, height: 640 },
          userAgent: info?.userAgent || "",
          deviceScaleFactor: info?.deviceScaleFactor || 1,
          isMobile: info?.isMobile || true,
          hasTouch: info?.hasTouch || true,
        };
      });
      
      logger.debug(`Sending ${devices.length} mobile devices to client`);
      socket.emit("mobileDevices", devices);
    } catch (error) {
      logger.error("Error getting mobile devices:", error);
      socket.emit("mobileDevices", []);
    }
  });

  // Handle desktop test case initiation
  socket.on("testCaseInitiated", (data) => {
    logger.info(`Desktop test case initiated for client: ${socket.id}`);
    socket.data.isMobile = false;
    
    handleTestCaseInitiated(socket, data).catch((error) => {
      logger.error("Error handling desktop testCaseInitiated:", error);
      socket.emit("message", `Error initiating desktop test case: ${error.message}`);
    });
  });

  // Handle mobile test case initiation
  socket.on("mobileTestCaseInitiated", (data) => {
    logger.info(`Mobile test case initiated for client: ${socket.id}`);
    socket.data.isMobile = true;
    socket.data.deviceName = data.deviceName;
    
    handleMobileTestCaseInitiated(socket, data).catch((error) => {
      logger.error("Error handling mobile testCaseInitiated:", error);
      socket.emit("message", `Error initiating mobile test case: ${error.message}`);
    });
  });

  // Handle incoming user messages
  socket.on("message", (msg) => {
    logger.debug(`Message received from client ${socket.id}: ${msg}`);
    
    handleSocketMessage(socket, msg).catch((error) => {
      logger.error("Error handling socket message:", error);
      socket.emit("message", `Error processing message: ${error.message}`);
    });
  });

  // Handle test case status updates
  socket.on("testCaseUpdate", (status) => {
    logger.debug(`Test case update received from client ${socket.id}: ${status}`);
    
    testCaseUpdateHandler(socket, status).catch((error) => {
      logger.error("Error handling testCaseUpdate:", error);
      socket.emit("message", `Error updating test case status: ${error.message}`);
    });
  });

  // Handle client disconnection
  socket.on("disconnect", async (reason) => {
    logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
    
    try {
      // Clean up mobile device manager if it exists
      if (socket.data.deviceManager) {
        logger.debug(`Cleaning up device manager for client: ${socket.id}`);
        await socket.data.deviceManager.cleanup();
        socket.data.deviceManager = undefined;
      }

      // Close any open browser pages
      if (socket.data.page) {
        logger.debug(`Closing browser page for client: ${socket.id}`);
        try {
          await socket.data.page.close();
        } catch (pageError) {
          logger.warn(`Error closing page: ${pageError.message}`);
        }
        socket.data.page = undefined;
      }

      // Reset socket data
      socket.data = {
        testCaseReviewAgent: undefined,
        lastCallId: undefined,
        previousResponseId: undefined,
        testCaseStatus: "pending",
        deviceManager: undefined,
        page: undefined,
        deviceName: undefined,
        isMobile: false,
      };
    } catch (cleanupError) {
      logger.error(`Error during cleanup for client ${socket.id}:`, cleanupError);
    }
  });

  // Handle connection errors
  socket.on("error", (error) => {
    logger.error(`Socket error for client ${socket.id}:`, error);
  });

  // Send initial connection confirmation
  socket.emit("connected", {
    message: "Successfully connected to mobile-enabled testing server",
    socketId: socket.id,
    timestamp: new Date().toISOString(),
  });
});

// Handle server-level errors
io.on("error", (error) => {
  logger.error("Socket.IO server error:", error);
});

// Graceful shutdown handling
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  
  // Close all socket connections
  io.close(() => {
    logger.info("Socket.IO server closed");
  });
  
  // Close HTTP server
  httpServer.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  
  // Close all socket connections
  io.close(() => {
    logger.info("Socket.IO server closed");
  });
  
  // Close HTTP server
  httpServer.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
httpServer.listen(PORT, () => {
  logger.info(`Mobile-enabled Socket.IO server listening on port ${PORT}`);
  logger.info(`CORS origin: ${CORS_ORIGIN}`);
  logger.info(`Available mobile devices: ${globalDeviceManager.getAvailableDevices().join(", ")}`);
  logger.info("Server ready to accept connections");
});

// Export for testing purposes
export { io, httpServer };
