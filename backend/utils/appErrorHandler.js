// errorHandler.js
import logger from "./logger.js";

class ErrorHandler extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (message, statusCode = 500, data = null) => {
  return new ErrorHandler(message, statusCode, data);
};

const handleDbError = (error) => {
  logger.error({
    message: "Critical database error",
    error: error.message,
    stack: error.stack,
  });

  // Exit the process as database is mandatory
  console.error(
    "CRITICAL ERROR: Database connection failed. Application cannot continue without database access."
  );
  process.exit(1);
};

const handleuncaughtExceptionError = () => {
  process.on("uncaughtException", (err) => {
    logger.error({
      message: "UNCAUGHT EXCEPTION! Shutting down...",
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });
};

const handleunhandledRejectionError = (server) => {
  process.on("unhandledRejection", async (err) => {
    logger.error({
      message: "UNHANDLED REJECTION! Shutting down...",
      error: err.message,
      stack: err.stack,
    });

    try {
      server.close(() => process.exit(1));
    } catch (e) {
      process.exit(1);
    }
  });
};

export {
  ErrorHandler,
  handleError,
  handleDbError,
  handleuncaughtExceptionError,
  handleunhandledRejectionError,
};
