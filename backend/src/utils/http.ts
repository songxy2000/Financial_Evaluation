import { Request, Response, NextFunction, type RequestHandler } from "express";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  next();
}

export function notFoundHandler(req: Request): never {
  throw new ApiError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.path}`);
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      requestId: req.requestId,
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message,
    requestId: req.requestId,
  });
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
