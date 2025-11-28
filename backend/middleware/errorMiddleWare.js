import logger from "../utils/logger.js";

const devErrors = (req, res, err) => {
  const errorResponse = {
    statusCode: -1,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      data: err.data,
      metadata: {
        route: req.originalUrl,
        method: req.method,
        ip: req.ip,
      },
    }),
  };
  console.log("dev error");

  logger.error({
    ...errorResponse,
    type: "API_ERROR",
    user: req.user?.id || "anonymous",
  });

  res.status(err.statusCode).json(errorResponse);
};

const prodErrors = (req, res, err) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    route: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  } else {
    res.status(500).json({
      statusCode: -1,
      message: "Something went wrong! Please try again later.",
    });
  }
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log("err middleware reached");

  if (process.env.NODE_ENV === "development") {
    devErrors(req, res, err);
  } else if (process.env.NODE_ENV === "production") {
    prodErrors(req, res, err);
  }
};
