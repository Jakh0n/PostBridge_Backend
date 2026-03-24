import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

interface ApiError extends Error {
  statusCode?: number;
  errors?: unknown;
}

/**
 * Centralized JSON error responses for the REST API.
 */
export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err);

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: "Invalid resource identifier",
    });
    return;
  }

  if (err.name === "ValidationError" && err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  const status = err.statusCode ?? 500;
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && err.errors
      ? { errors: err.errors }
      : {}),
  });
}
