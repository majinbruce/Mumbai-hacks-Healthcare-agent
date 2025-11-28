import { runHealthcareAgent } from "./agentService.js";
import logger from "../utils/logger.js";
import { savePrediction } from "../utils/predictionStorage.js";
import Prediction from "../models/Prediction.js";

const predictService = async (
  festival,
  aqi,
  epidemic,
  currentStaffing,
  currentSupply
) => {
  try {
    logger.info("Running healthcare prediction agent...");

    // Validate inputs
    if (!currentStaffing || !currentSupply) {
      throw new Error("Current staffing and supply information are required");
    }

    // Run the healthcare agent
    const result = await runHealthcareAgent({
      festival,
      aqi,
      epidemic,
      currentStaffing,
      currentSupply,
    });

    logger.info("Healthcare agent completed successfully");

    // With structured output enabled, recommendations will already be a properly typed object
    // matching the HealthcareRecommendationSchema. No parsing needed!
    const recommendations = result.recommendations;

    const predictionResult = {
      success: true,
      recommendations,
      metadata: {
        inputs: {
          festival,
          aqi,
          epidemic,
          currentStaffing,
          currentSupply,
        },
        timestamp: new Date().toISOString(),
      },
    };

    // Save prediction to storage (both Qdrant and PostgreSQL)
    try {
      // Save to Qdrant
      await savePrediction(predictionResult);

      // Save to PostgreSQL
      const pgResult = await Prediction.create({
        festival,
        aqi,
        epidemic,
        currentStaffing,
        currentSupply,
        recommendations: predictionResult.recommendations
      });

      predictionResult.id = pgResult.id; // Use PostgreSQL UUID as primary ID
      logger.info(`Prediction saved to both storages with ID: ${pgResult.id}`);
    } catch (saveError) {
      logger.error("Error saving prediction (non-critical):", saveError);
      // Continue without failing the request
    }

    return predictionResult;
  } catch (error) {
    logger.error("Error in predictService:", error);
    throw error;
  }
};

export default predictService;
