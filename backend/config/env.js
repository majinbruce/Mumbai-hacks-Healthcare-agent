import dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT || 9000,
  node_env: process.env.NODE_ENV || "development",

  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Qdrant Configuration
  QDRANT_URL: process.env.QDRANT_URL || "http://localhost:6333",
  QDRANT_API_KEY: process.env.QDRANT_API_KEY,

  // PostgreSQL Configuration
  POSTGRES_HOST: process.env.POSTGRES_HOST || "localhost",
  POSTGRES_PORT: process.env.POSTGRES_PORT || 5432,
  POSTGRES_USER: process.env.POSTGRES_USER || "healthcare_user",
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "healthcare_pass_2024",
  POSTGRES_DB: process.env.POSTGRES_DB || "healthcare_db",
};

export { config };
export default config;
