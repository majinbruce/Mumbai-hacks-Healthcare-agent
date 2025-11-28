import { OpenAIEmbeddings } from "@langchain/openai";
import { qdrantClient, COLLECTION_NAME } from "../config/qdrant.js";
import { config } from "../config/env.js";

// Initialize OpenAI embeddings with LangChain
const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  apiKey: config.OPENAI_API_KEY,
});

// Generate embedding for text using LangChain
export const generateEmbedding = async (text) => {
  try {
    const embedding = await embeddings.embedQuery(text);
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
};

// Index single healthcare knowledge entry into Qdrant
export const indexKnowledgeEntry = async (data) => {
  try {
    const {
      id,
      festival,
      aqi,
      season,
      healthImpact,
      recommendedStaffing,
      requiredSupplies,
      patientAdvisory,
    } = data;

    // Create text representation for embedding
    const textForEmbedding = `
      Festival/Event: ${festival || "N/A"}
      AQI Level: ${aqi || "N/A"}
      Season: ${season || "N/A"}
      Health Impact: ${healthImpact}
      Recommended Staffing: ${recommendedStaffing}
      Required Supplies: ${requiredSupplies}
      Patient Advisory: ${patientAdvisory}
    `.trim();

    const embedding = await generateEmbedding(textForEmbedding);

    // Upsert point to Qdrant
    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: id,
          vector: embedding,
          payload: data,
        },
      ],
    });

    return { success: true, id };
  } catch (error) {
    console.error("Error indexing knowledge entry:", error);
    throw error;
  }
};

// Index multiple healthcare knowledge entries
export const indexMultipleEntries = async (entries) => {
  try {
    console.log(`Starting to index ${entries.length} entries...`);

    const points = [];

    for (const item of entries) {
      // Create text representation for embedding
      const textForEmbedding = `
        Festival/Event: ${item.festival || "N/A"}
        AQI Level: ${item.aqi || "N/A"}
        Season: ${item.season || "N/A"}
        Health Impact: ${item.healthImpact}
        Recommended Staffing: ${item.recommendedStaffing}
        Required Supplies: ${item.requiredSupplies}
        Patient Advisory: ${item.patientAdvisory}
      `.trim();

      const embedding = await generateEmbedding(textForEmbedding);

      points.push({
        id: item.id,
        vector: embedding,
        payload: item,
      });
    }

    // Upsert points to Qdrant
    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points: points,
    });

    console.log(`Successfully indexed ${points.length} entries`);
    return { success: true, count: points.length };
  } catch (error) {
    console.error("Error indexing entries:", error);
    throw error;
  }
};

// Search for relevant context from Qdrant
export const searchHealthcareContext = async (query, limit = 3) => {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: limit,
      with_payload: true,
    });

    return searchResult.map((result) => ({
      score: result.score,
      data: result.payload,
    }));
  } catch (error) {
    console.error("Error searching healthcare context:", error);
    return [];
  }
};

// Delete entry from Qdrant
export const deleteKnowledgeEntry = async (id) => {
  try {
    await qdrantClient.delete(COLLECTION_NAME, {
      wait: true,
      points: [id],
    });
    return { success: true, id };
  } catch (error) {
    console.error("Error deleting knowledge entry:", error);
    throw error;
  }
};

// Get total count of entries
export const getTotalEntriesCount = async () => {
  try {
    const result = await qdrantClient.count(COLLECTION_NAME);
    return result.count;
  } catch (error) {
    console.error("Error getting total entries count:", error);
    return 0;
  }
};

// Get all entries (for listing)
export const getAllEntries = async (limit = 100, offset = 0) => {
  try {
    const result = await qdrantClient.scroll(COLLECTION_NAME, {
      limit: limit,
      offset: offset,
      with_payload: true,
      with_vector: false,
    });

    return result.points.map((point) => ({
      id: point.id,
      ...point.payload,
    }));
  } catch (error) {
    console.error("Error getting all entries:", error);
    throw error;
  }
};
