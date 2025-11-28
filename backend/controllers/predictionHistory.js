import asyncHandler from "../utils/asyncErrorHandler.js";
import logger from "../utils/logger.js";
import { getAllPredictions, getPredictionById } from "../utils/predictionStorage.js";

// Get all predictions
export const getPredictions = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  logger.info("Fetching predictions", { limit, offset });

  const result = await getAllPredictions(limit, offset);

  res.status(200).json({
    statusCode: 0,
    message: "Predictions retrieved successfully",
    data: result,
  });
});

// Get single prediction by ID
export const getPrediction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  logger.info("Fetching prediction by ID", { id });

  const prediction = await getPredictionById(id);

  if (!prediction) {
    return res.status(404).json({
      statusCode: 1,
      message: "Prediction not found",
    });
  }

  res.status(200).json({
    statusCode: 0,
    message: "Prediction retrieved successfully",
    data: prediction,
  });
});
