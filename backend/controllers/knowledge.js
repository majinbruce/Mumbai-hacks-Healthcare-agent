import asyncHandler from "../utils/asyncErrorHandler.js";
import logger from "../utils/logger.js";
import {
  parsePDFWithLangChain,
  parseCSVWithLangChain,
  parseExcel,
  extractKnowledgeFromDocuments,
  processStructuredData,
  cleanupFile,
} from "../utils/fileParser.js";
import {
  indexKnowledgeEntry,
  indexMultipleEntries,
  deleteKnowledgeEntry,
  getAllEntries,
  getTotalEntriesCount,
} from "../utils/qdrantIndexer.js";

// Upload and index file (PDF, CSV, Excel)
export const uploadAndIndexFile = asyncHandler(async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        statusCode: 1,
        message: "No file uploaded",
      });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    logger.info(`Processing file: ${req.file.filename}, type: ${fileType}`);

    let entries = [];

    // Handle PDF files
    if (fileType === "application/pdf") {
      const { fullText } = await parsePDFWithLangChain(filePath);
      entries = await extractKnowledgeFromDocuments(fullText);
    }
    // Handle CSV files
    else if (fileType === "text/csv") {
      const { documents } = await parseCSVWithLangChain(filePath);
      // documents are already parsed objects, no need for JSON.parse
      entries = processStructuredData(documents);
    }
    // Handle Excel files
    else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileType === "application/vnd.ms-excel"
    ) {
      const excelData = parseExcel(filePath);
      entries = processStructuredData(excelData);
    } else {
      cleanupFile(filePath);
      return res.status(400).json({
        statusCode: 1,
        message: "Unsupported file type. Please upload PDF, CSV, or Excel files.",
      });
    }

    // Index entries into Qdrant
    if (entries.length > 0) {
      const result = await indexMultipleEntries(entries);

      // Cleanup uploaded file
      cleanupFile(filePath);

      logger.info(`Successfully indexed ${result.count} entries from file`);

      res.status(200).json({
        statusCode: 0,
        message: "File processed and indexed successfully",
        data: {
          entriesIndexed: result.count,
          entries: entries,
        },
      });
    } else {
      cleanupFile(filePath);

      res.status(400).json({
        statusCode: 1,
        message: "No valid healthcare knowledge entries found in the file",
      });
    }
  } catch (error) {
    if (req.file) {
      cleanupFile(req.file.path);
    }
    logger.error("Error uploading and indexing file:", error);
    throw error;
  }
});

// Add single knowledge entry manually
export const addKnowledgeEntry = asyncHandler(async (req, res, next) => {
  const {
    id,
    festival,
    aqi,
    season,
    healthImpact,
    recommendedStaffing,
    requiredSupplies,
    patientAdvisory,
  } = req.body;

  if (!healthImpact) {
    return res.status(400).json({
      statusCode: 1,
      message: "healthImpact is required",
    });
  }

  const { v4: uuidv4 } = await import("uuid");

  const entry = {
    id: id || uuidv4(),
    festival: festival || null,
    aqi: aqi || null,
    season: season || null,
    healthImpact,
    recommendedStaffing: recommendedStaffing || "",
    requiredSupplies: requiredSupplies || "",
    patientAdvisory: patientAdvisory || "",
  };

  const result = await indexKnowledgeEntry(entry);

  logger.info(`Indexed manual entry with ID: ${result.id}`);

  res.status(200).json({
    statusCode: 0,
    message: "Knowledge entry added successfully",
    data: { id: result.id, entry },
  });
});

// Get all knowledge entries
export const getKnowledgeEntries = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;

  const entries = await getAllEntries(limit, offset);
  const totalCount = await getTotalEntriesCount();

  res.status(200).json({
    statusCode: 0,
    message: "Knowledge entries retrieved successfully",
    data: {
      entries,
      count: totalCount,
      total: totalCount,
      returned: entries.length,
      limit,
      offset,
    },
  });
});

// Delete knowledge entry
export const deleteKnowledge = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      statusCode: 1,
      message: "Entry ID is required",
    });
  }

  const result = await deleteKnowledgeEntry(id);

  logger.info(`Deleted knowledge entry with ID: ${id}`);

  res.status(200).json({
    statusCode: 0,
    message: "Knowledge entry deleted successfully",
    data: result,
  });
});
