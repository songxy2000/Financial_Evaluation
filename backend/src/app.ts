import cors from "cors";
import express from "express";
import { awardsRouter } from "./routes/awards";
import { evaluationsRouter } from "./routes/evaluations";
import { applicationsRouter } from "./routes/applications";
import { arenaRouter } from "./routes/arena";
import { internalRouter } from "./routes/internal";
import { errorHandler, notFoundHandler, requestIdMiddleware } from "./utils/http";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(requestIdMiddleware);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", ts: new Date().toISOString() });
  });

  app.use("/api/v1/evaluations", evaluationsRouter);
  app.use("/api/v1/awards", awardsRouter);
  app.use("/api/v1/applications", applicationsRouter);
  app.use("/api/v1/arena", arenaRouter);
  app.use("/api/v1/internal", internalRouter);

  app.use((req) => notFoundHandler(req));
  app.use(errorHandler);

  return app;
}

