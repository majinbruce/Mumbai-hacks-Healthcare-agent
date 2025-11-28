import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
const { combine, timestamp, printf, errors, colorize } = winston.format;

const logFormat = printf(({ timestamp, level, message, stack, ...meta }) => {
  const errorMessage =
    stack || (message instanceof Error ? message.stack : message);

  const formattedMessage =
    typeof errorMessage === "object"
      ? JSON.stringify(errorMessage)
      : errorMessage;

  const metaData =
    Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : "";

  return `${timestamp} [${level.toUpperCase()}]: ${formattedMessage}${metaData}`;
});

// Different formats for environments
const devFormat = combine(
  //colorize(), // Add colors for better readability in development
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }), // Log stack trace for errors
  logFormat
);

const prodFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }), // Log stack trace for errors
  logFormat
);

// Determine the environment
const isProduction = process.env.NODE_ENV === "production";

// Create logger instance
const logger = winston.createLogger({
  level: isProduction ? "info" : "debug", // Use 'debug' in dev, 'info' in prod
  format: isProduction ? prodFormat : devFormat,
  transports: [
    // Console logging (always enabled in development, optional in production)
    new winston.transports.Console({
      silent: isProduction, // Disable console logs in production if required
    }),

    new winston.transports.File({ filename: "logs/http.log", level: "http" }),
    // File transports
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// Add daily rotate transport for production
if (isProduction) {
  logger.add(
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d", // Retain logs for 14 days
    })
  );
}

export default logger;
