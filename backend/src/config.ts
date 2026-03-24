import path from "path";
import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT ?? 4100);

if (!Number.isFinite(port) || port <= 0) {
  throw new Error("Invalid PORT value");
}

export const config = {
  port,
  dbPath: path.resolve(process.cwd(), process.env.DB_PATH ?? "./data/backend.db"),
  timezone: "Asia/Shanghai",
};
