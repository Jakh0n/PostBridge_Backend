import type { Request, Response } from "express";
import { Parcel } from "../models/Parcel.js";
import { escapeRegex } from "../utils/escapeRegex.js";

/**
 * GET /api/parcels
 * Optional query: city — matches `from` or `to` (case-insensitive substring).
 */
export async function listParcels(req: Request, res: Response): Promise<void> {
  const city = req.query.city;
  const filter: Record<string, unknown> = {};

  if (typeof city === "string" && city.trim()) {
    const safe = escapeRegex(city.trim());
    const regex = new RegExp(safe, "i");
    filter.$or = [{ from: regex }, { to: regex }];
  }

  const parcels = await Parcel.find(filter).sort({ createdAt: -1 }).lean().exec();

  res.json({
    success: true,
    data: parcels.map((p) => ({
      id: p._id.toString(),
      from: p.from,
      to: p.to,
      parcelType: p.parcelType,
      price: p.price,
      contact: p.contact,
      description: p.description,
      createdAt: p.createdAt,
    })),
  });
}

/**
 * POST /api/parcels
 */
export async function createParcel(req: Request, res: Response): Promise<void> {
  const doc = await Parcel.create(req.body);
  res.status(201).json({
    success: true,
    data: {
      id: doc._id.toString(),
      from: doc.from,
      to: doc.to,
      parcelType: doc.parcelType,
      price: doc.price,
      contact: doc.contact,
      description: doc.description,
      createdAt: doc.createdAt,
    },
  });
}

/**
 * GET /api/parcels/:id
 */
export async function getParcelById(req: Request, res: Response): Promise<void> {
  const parcel = await Parcel.findById(req.params.id).lean().exec();
  if (!parcel) {
    res.status(404).json({ success: false, message: "Parcel not found" });
    return;
  }

  res.json({
    success: true,
    data: {
      id: parcel._id.toString(),
      from: parcel.from,
      to: parcel.to,
      parcelType: parcel.parcelType,
      price: parcel.price,
      contact: parcel.contact,
      description: parcel.description,
      createdAt: parcel.createdAt,
    },
  });
}

/**
 * DELETE /api/parcels/:id
 */
export async function deleteParcel(req: Request, res: Response): Promise<void> {
  const result = await Parcel.findByIdAndDelete(req.params.id).exec();
  if (!result) {
    res.status(404).json({ success: false, message: "Parcel not found" });
    return;
  }
  res.status(204).send();
}
