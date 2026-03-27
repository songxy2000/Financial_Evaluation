import dotenv from "dotenv";

dotenv.config();

function parseCsv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 4100);
const nodeEnv = process.env.NODE_ENV ?? "development";
const corsOrigins = parseCsv(process.env.CORS_ORIGINS);
const internalApiKey = process.env.INTERNAL_API_KEY;
const adminApiKey = process.env.ADMIN_API_KEY;

if (!Number.isFinite(port) || port <= 0) {
  throw new Error("Invalid PORT value");
}

if (nodeEnv === "production" && corsOrigins.length === 0) {
  throw new Error("CORS_ORIGINS is required in production");
}

if (nodeEnv === "production" && !internalApiKey) {
  throw new Error("INTERNAL_API_KEY is required in production");
}

if (nodeEnv === "production" && !adminApiKey) {
  throw new Error("ADMIN_API_KEY is required in production");
}

export const config = {
  host,
  port,
  nodeEnv,
  isProduction: nodeEnv === "production",
  databaseUrl:
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/financial_ai_eval",
  pgSsl: process.env.PGSSL === "true",
  corsOrigins,
  internalApiKey,
  adminApiKey,
  timezone: "Asia/Shanghai",
};
