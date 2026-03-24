import { body, param, validationResult, type ValidationChain } from "express-validator";
import type { NextFunction, Request, Response } from "express";

/**
 * Runs express-validator chains and returns 400 with aggregated errors if invalid.
 */
export function validate(chains: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(chains.map((c) => c.run(req)));
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.array(),
      });
      return;
    }
    next();
  };
}

export const createParcelRules: ValidationChain[] = [
  body("role")
    .isIn(["sender", "courier"])
    .withMessage("role must be sender or courier"),
  body("from").trim().notEmpty().withMessage("from is required"),
  body("to").trim().notEmpty().withMessage("to is required"),
  body("parcelType").trim().notEmpty().withMessage("parcelType is required"),
  body("weightKg")
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("weightKg must be a non-negative number"),
  body("date").optional().isString().trim(),
  body("availableDate").optional().isString().trim(),
  body("vehicleType").optional().isString().trim(),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("price must be a non-negative number"),
  body("description").optional().isString(),
  body("contact").isObject().withMessage("contact must be an object"),
  body("contact.phone").optional().isString().trim(),
  body("contact.telegram").optional().isString().trim(),
  body().custom((_value, { req }) => {
    const bodyData = req.body as {
      role?: "sender" | "courier";
      weightKg?: number;
      date?: string;
      availableDate?: string;
      vehicleType?: string;
      contact?: { phone?: string; telegram?: string };
    };
    const phone = bodyData.contact?.phone?.trim();
    const telegram = bodyData.contact?.telegram?.trim();
    if (!phone && !telegram) {
      throw new Error("Provide contact.phone and/or contact.telegram");
    }

    if (bodyData.role === "sender") {
      if (!bodyData.date?.trim()) {
        throw new Error("date is required for sender posts");
      }
      if (
        typeof bodyData.weightKg !== "number" ||
        !Number.isFinite(bodyData.weightKg) ||
        bodyData.weightKg < 0
      ) {
        throw new Error("weightKg is required for sender posts");
      }
    }

    if (bodyData.role === "courier" && !bodyData.availableDate?.trim()) {
      throw new Error("availableDate is required for courier posts");
    }

    return true;
  }),
];

export const parcelIdParam: ValidationChain[] = [
  param("id").isMongoId().withMessage("Invalid parcel id"),
];
