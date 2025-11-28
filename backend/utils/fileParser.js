import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import xlsx from "xlsx";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/env.js";

// Initialize OpenAI model
const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.3,
  apiKey: config.OPENAI_API_KEY,
});

// Define healthcare knowledge schema
const healthcareKnowledgeSchema = z.object({
  entries: z.array(
    z.object({
      festival: z.string().nullable().describe("Name of festival or event"),
      aqi: z.string().nullable().describe("AQI level description"),
      season: z.string().nullable().describe("Season"),
      healthImpact: z.string().describe("Health impacts description"),
      recommendedStaffing: z.string().describe("Staffing recommendations"),
      requiredSupplies: z.string().describe("Required medical supplies"),
      patientAdvisory: z.string().describe("Patient advisory information"),
    })
  ),
});

// Parse PDF file using LangChain
export const parsePDFWithLangChain = async (filePath) => {
  try {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    // Combine all pages
    const fullText = docs.map((doc) => doc.pageContent).join("\n\n");

    return {
      documents: docs,
      fullText: fullText,
      pageCount: docs.length,
    };
  } catch (error) {
    console.error("Error parsing PDF with LangChain:", error);
    throw new Error("Failed to parse PDF file");
  }
};

// Parse CSV file using LangChain
export const parseCSVWithLangChain = async (filePath) => {
  try {
    const loader = new CSVLoader(filePath);
    const docs = await loader.load();

    // Convert LangChain's key-value format to JSON objects
    const parsedData = docs.map((doc) => {
      const obj = {};
      const lines = doc.pageContent.split('\n');

      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          obj[key] = value;
        }
      });

      return obj;
    });

    return {
      documents: parsedData,
      rowCount: parsedData.length,
    };
  } catch (error) {
    console.error("Error parsing CSV with LangChain:", error);
    throw new Error("Failed to parse CSV file");
  }
};

// Parse Excel file (LangChain doesn't have built-in Excel loader)
export const parseExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    const allData = [];

    sheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      allData.push(...jsonData);
    });

    return allData;
  } catch (error) {
    console.error("Error parsing Excel:", error);
    throw new Error("Failed to parse Excel file");
  }
};

// Extract structured healthcare knowledge from documents using LangChain
export const extractKnowledgeFromDocuments = async (text) => {
  try {
    // Create text splitter for large documents
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.splitText(text);

    // Create output parser
    const parser = StructuredOutputParser.fromZodSchema(healthcareKnowledgeSchema);

    // Create prompt template
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a healthcare data extraction assistant. Extract structured healthcare knowledge from the provided text.

Extract information about:
- Festivals/Events and their health impacts
- AQI levels and health effects
- Seasonal health patterns
- Required staffing recommendations
- Supply requirements
- Patient advisories

{format_instructions}

Text to analyze:
{text}

If the text doesn't contain relevant healthcare information, return an empty entries array.
`);

    const formatInstructions = parser.getFormatInstructions();

    let allEntries = [];

    // Process each chunk
    for (const chunk of chunks) {
      const prompt = await promptTemplate.format({
        format_instructions: formatInstructions,
        text: chunk,
      });

      const response = await llm.invoke(prompt);
      const parsed = await parser.parse(response.content);

      if (parsed.entries && parsed.entries.length > 0) {
        allEntries.push(...parsed.entries);
      }
    }

    // Add unique IDs to each entry
    return allEntries.map((entry) => ({
      id: uuidv4(),
      ...entry,
    }));
  } catch (error) {
    console.error("Error extracting knowledge:", error);
    throw new Error("Failed to extract knowledge from documents");
  }
};

// Process Excel/CSV data into healthcare knowledge format
export const processStructuredData = (data) => {
  try {
    const entries = [];

    data.forEach((row) => {
      // Map common column names to our structure
      const entry = {
        id: row.id || uuidv4(),
        festival: row.festival || row.Festival || row.event || row.Event || null,
        aqi: row.aqi || row.AQI || row["AQI Level"] || null,
        season: row.season || row.Season || null,
        healthImpact:
          row.healthImpact ||
          row["Health Impact"] ||
          row.impact ||
          row.Impact ||
          "",
        recommendedStaffing:
          row.recommendedStaffing ||
          row["Recommended Staffing"] ||
          row.staffing ||
          row.Staffing ||
          "",
        requiredSupplies:
          row.requiredSupplies ||
          row["Required Supplies"] ||
          row.supplies ||
          row.Supplies ||
          "",
        patientAdvisory:
          row.patientAdvisory ||
          row["Patient Advisory"] ||
          row.advisory ||
          row.Advisory ||
          "",
      };

      // Only add if it has meaningful data
      if (
        entry.healthImpact ||
        entry.recommendedStaffing ||
        entry.requiredSupplies
      ) {
        entries.push(entry);
      }
    });

    return entries;
  } catch (error) {
    console.error("Error processing structured data:", error);
    throw new Error("Failed to process structured data");
  }
};

// Clean up uploaded file
export const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error cleaning up file:", error);
  }
};
