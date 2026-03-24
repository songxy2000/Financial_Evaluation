import { config } from "./config";
import { initDb } from "./db/init";
import { createApp } from "./app";

async function startServer() {
  await initDb();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Backend listening on http://localhost:${config.port}`);
    console.log(`Database: ${config.databaseUrl}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
