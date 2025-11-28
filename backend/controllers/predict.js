import asyncHandler from "../utils/asyncErrorHandler.js";
import logger from "../utils/logger.js";
import predictService from "../services/predictService.js";

const predict = asyncHandler(async (req, res, next) => {
  const { festival, aqi, epidemic, currentStaffing, currentSupply } = req.body;

  // Validate required fields
  if (!currentStaffing || !currentSupply) {
    return res.status(400).json({
      statusCode: 1,
      message: "currentStaffing and currentSupply are required fields",
    });
  }

  logger.info("Received prediction request", {
    festival,
    aqi,
    epidemic,
  });

  const result = await predictService(
    festival,
    aqi,
    epidemic,
    currentStaffing,
    currentSupply
  );

  res.status(200).json({
    statusCode: 0,
    message: "Prediction completed successfully",
    data: result,
  });
});

export { predict };
