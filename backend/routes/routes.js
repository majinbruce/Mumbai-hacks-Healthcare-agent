import express from "express";
import { predict } from "../controllers/predict.js";
import {
  uploadAndIndexFile,
  addKnowledgeEntry,
  getKnowledgeEntries,
  deleteKnowledge,
} from "../controllers/knowledge.js";
import { getPredictions, getPrediction } from "../controllers/predictionHistory.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Prediction endpoints
router.post("/predict", predict);
router.get("/predictions", getPredictions);
router.get("/predictions/:id", getPrediction);

// Knowledge management endpoints
router.post("/knowledge/upload", upload.single("file"), uploadAndIndexFile);
router.post("/knowledge/add", addKnowledgeEntry);
router.get("/knowledge", getKnowledgeEntries);
router.delete("/knowledge/:id", deleteKnowledge);

export default router;
