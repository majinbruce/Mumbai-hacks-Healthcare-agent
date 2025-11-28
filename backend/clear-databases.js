import { qdrantClient, COLLECTION_NAME } from "./config/qdrant.js";
import pool from "./config/database.js";
import logger from "./utils/logger.js";

/**
 * Script to clear all data from PostgreSQL and Qdrant databases
 * Run with: node clear-databases.js
 */

async function clearPostgreSQL() {
  logger.info("Starting PostgreSQL database cleanup...");

  const tables = ["predictions", "knowledge_entries", "uploaded_files"];

  try {
    for (const table of tables) {
      // Check if table exists
      const checkQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `;
      const result = await pool.query(checkQuery, [table]);
      const tableExists = result.rows[0].exists;

      if (tableExists) {
        // Clear the table
        await pool.query(`TRUNCATE TABLE ${table} CASCADE`);
        logger.info(`✓ Cleared ${table} table`);
      } else {
        logger.info(`⊘ Table ${table} does not exist, skipping...`);
      }
    }

    logger.info("PostgreSQL database cleared successfully!");
    return true;
  } catch (error) {
    logger.error("Error clearing PostgreSQL database:", error);
    throw error;
  }
}

async function clearQdrant() {
  logger.info("Starting Qdrant database cleanup...");

  try {
    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      (col) => col.name === COLLECTION_NAME
    );

    if (collectionExists) {
      // Delete the collection
      await qdrantClient.deleteCollection(COLLECTION_NAME);
      logger.info(`✓ Deleted collection: ${COLLECTION_NAME}`);

      // Recreate the collection
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 1536, // OpenAI embedding dimension
          distance: "Cosine",
        },
      });
      logger.info(`✓ Recreated collection: ${COLLECTION_NAME}`);
    } else {
      logger.info(`Collection ${COLLECTION_NAME} does not exist, creating new one...`);

      // Create the collection
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 1536,
          distance: "Cosine",
        },
      });
      logger.info(`✓ Created collection: ${COLLECTION_NAME}`);
    }

    logger.info("Qdrant database cleared successfully!");
    return true;
  } catch (error) {
    logger.error("Error clearing Qdrant database:", error);
    throw error;
  }
}

async function main() {
  console.log("\n========================================");
  console.log("  Database Cleanup Script");
  console.log("========================================\n");

  try {
    // Clear PostgreSQL
    await clearPostgreSQL();
    console.log("");

    // Clear Qdrant
    await clearQdrant();
    console.log("");

    console.log("========================================");
    console.log("  All databases cleared successfully!");
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("\n========================================");
    console.error("  Database cleanup failed!");
    console.error("========================================\n");
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();
