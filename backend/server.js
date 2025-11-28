import config from "./config/env.js";

import {
  handleuncaughtExceptionError,
  handleunhandledRejectionError,
} from "./utils/appErrorHandler.js";

handleuncaughtExceptionError();

import app from "./app.js";
import { initQdrantCollection } from "./config/qdrant.js";
import { initializePredictionsCollection } from "./utils/predictionStorage.js";

const port = config.port;

// Initialize Qdrant collection before starting server
const startServer = async () => {
  try {
    console.log("Initializing Qdrant collections...");
    await initQdrantCollection();
    await initializePredictionsCollection();
    console.log("Qdrant collections initialized successfully");

    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`\nAPI Endpoints:`);
      console.log(`- POST /api/predict - Get healthcare recommendations`);
      console.log(`- POST /api/knowledge/upload - Upload PDF/CSV/Excel files`);
      console.log(`- POST /api/knowledge/add - Add knowledge entry manually`);
      console.log(`- GET /api/knowledge - List all knowledge entries`);
      console.log(`- DELETE /api/knowledge/:id - Delete knowledge entry`);
    });

    handleunhandledRejectionError(server);
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
};

startServer();
