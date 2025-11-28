import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

async function testCSVLoader() {
  const loader = new CSVLoader("/home/omkarc/Documents/genAI/HealthcareAgent/test-files/healthcare_knowledge.csv");
  const docs = await loader.load();

  console.log("Number of documents:", docs.length);
  console.log("\nFirst document:");
  console.log("pageContent type:", typeof docs[0].pageContent);
  console.log("pageContent:", docs[0].pageContent);
  console.log("\nmetadata:", docs[0].metadata);
}

testCSVLoader().catch(console.error);
