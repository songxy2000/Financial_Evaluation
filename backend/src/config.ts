import dotenv from "dotenv";

dotenv.config();

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 4100);

if (!Number.isFinite(port) || port <= 0) {
  throw new Error("Invalid PORT value");
}

export const config = {
  host,
  port,
  databaseUrl:
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/financial_ai_eval",
  pgSsl: process.env.PGSSL === "true",
  timezone: "Asia/Shanghai",
};
