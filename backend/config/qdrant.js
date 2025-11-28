import { QdrantClient } from "@qdrant/js-client-rest";
import { config } from "./env.js";

const qdrantClient = new QdrantClient({
  url: config.QDRANT_URL || "http://localhost:6333",
  apiKey: config.QDRANT_API_KEY,
});

const COLLECTION_NAME = "healthcare_knowledge";

// Initialize Qdrant collection
export const initQdrantCollection = async () => {
  try {
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      (col) => col.name === COLLECTION_NAME
    );

    if (!collectionExists) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 1536, // OpenAI embedding dimension
          distance: "Cosine",
        },
      });
      console.log(`Created collection: ${COLLECTION_NAME}`);
    }
  } catch (error) {
    console.error("Error initializing Qdrant collection:", error);
    throw error;
  }
};

export { qdrantClient, COLLECTION_NAME };
