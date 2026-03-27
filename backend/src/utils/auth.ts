import type { Request, RequestHandler } from "express";
import { ApiError } from "./http";

function readApiKey(req: Request): string | undefined {
  const headerApiKey = req.header("x-api-key")?.trim();
  if (headerApiKey) return headerApiKey;

  const authorization = req.header("authorization")?.trim();
  if (!authorization) return undefined;

  const [scheme, token] = authorization.split(/\s+/, 2);
  if (scheme?.toLowerCase() !== "bearer" || !token) return undefined;
  return token.trim();
}

export function requireApiKey(expectedKey: string | undefined, keyName: string): RequestHandler {
  return (req, _res, next) => {
    if (!expectedKey) {
      if (process.env.NODE_ENV !== "production") {
        next();
        return;
      }

      next(new ApiError(503, "API_KEY_NOT_CONFIGURED", `${keyName} is not configured`));
      return;
    }

    const providedKey = readApiKey(req);
    if (providedKey !== expectedKey) {
      next(new ApiError(401, "UNAUTHORIZED", "Missing or invalid API key"));
      return;
    }

    next();
  };
}
