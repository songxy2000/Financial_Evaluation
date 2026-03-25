import { config } from "./config";
import { initDb } from "./db/init";
import { createApp } from "./app";

async function startServer() {
  await initDb();

  const app = createApp();
  app.listen(config.port, config.host, () => {
    const publicHost = config.host === "0.0.0.0" ? "localhost" : config.host;
    console.log(`Backend listening on http://${publicHost}:${config.port}`);
    console.log(`Database: ${config.databaseUrl}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
