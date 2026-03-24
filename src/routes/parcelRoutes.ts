import { Router } from "express";
import {
  createParcel,
  deleteParcel,
  getParcelById,
  listParcels,
} from "../controllers/parcelController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  createParcelRules,
  parcelIdParam,
  validate,
} from "../middleware/validateParcel.js";

const router = Router();

router.get("/", asyncHandler(listParcels));
router.post("/", validate(createParcelRules), asyncHandler(createParcel));
router.get("/:id", validate(parcelIdParam), asyncHandler(getParcelById));
router.delete("/:id", validate(parcelIdParam), asyncHandler(deleteParcel));

export default router;
