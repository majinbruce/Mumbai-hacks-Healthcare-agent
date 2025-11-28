import { qdrantClient } from "../config/qdrant.js";
import logger from "./logger.js";
import { v4 as uuidv4 } from "uuid";

const PREDICTIONS_COLLECTION = "healthcare_predictions";

// Initialize predictions collection
export const initializePredictionsCollection = async () => {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (col) => col.name === PREDICTIONS_COLLECTION
    );

    if (!exists) {
      await qdrantClient.createCollection(PREDICTIONS_COLLECTION, {
        vectors: {
          size: 1, // Dummy vector, we're using it as a document store
          distance: "Cosine",
        },
      });
      logger.info(`Created ${PREDICTIONS_COLLECTION} collection`);
    }
  } catch (error) {
    logger.error("Error initializing predictions collection:", error);
  }
};

// Save prediction
export const savePrediction = async (predictionData) => {
  try {
    const id = uuidv4(); // Use UUID instead of timestamp

    await qdrantClient.upsert(PREDICTIONS_COLLECTION, {
      points: [
        {
          id,
          vector: [0], // Dummy vector
          payload: {
            ...predictionData,
            id,
            createdAt: new Date().toISOString(),
          },
        },
      ],
    });

    logger.info(`Saved prediction with ID: ${id}`);
    return id;
  } catch (error) {
    logger.error("Error saving prediction:", error);
    throw error;
  }
};

// Get total count of predictions
export const getTotalPredictionsCount = async () => {
  try {
    const result = await qdrantClient.count(PREDICTIONS_COLLECTION);
    return result.count;
  } catch (error) {
    logger.error("Error getting total predictions count:", error);
    return 0;
  }
};

// Get all predictions
export const getAllPredictions = async (limit = 50, offset = 0) => {
  try {
    const response = await qdrantClient.scroll(PREDICTIONS_COLLECTION, {
      limit,
      offset,
      with_payload: true,
      with_vector: false,
    });

    const predictions = response.points.map((point) => point.payload);
    const totalCount = await getTotalPredictionsCount();

    return {
      predictions,
      count: totalCount,
      total: totalCount,
      returned: predictions.length,
    };
  } catch (error) {
    logger.error("Error fetching predictions:", error);
    return { predictions: [], count: 0, total: 0, returned: 0 };
  }
};

// Get single prediction by ID
export const getPredictionById = async (id) => {
  try {
    const response = await qdrantClient.retrieve(PREDICTIONS_COLLECTION, {
      ids: [id],
      with_payload: true,
      with_vector: false,
    });

    if (response.length === 0) {
      return null;
    }

    return response[0].payload;
  } catch (error) {
    logger.error("Error fetching prediction by ID:", error);
    return null;
  }
};
