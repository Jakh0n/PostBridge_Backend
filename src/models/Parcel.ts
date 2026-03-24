import mongoose, { Schema, type Document, type Model } from "mongoose";

/** Contact options for reaching the parcel poster (Telegram and/or phone). */
export interface ParcelContact {
  phone?: string;
  telegram?: string;
}

export interface ParcelAttrs {
  role: "sender" | "courier";
  from: string;
  to: string;
  parcelType: string;
  weightKg?: number;
  date?: string;
  availableDate?: string;
  vehicleType?: string;
  price: number;
  contact: ParcelContact;
  description?: string;
}

export interface ParcelDoc extends ParcelAttrs, Document {
  createdAt: Date;
}

const contactSchema = new Schema<ParcelContact>(
  {
    phone: { type: String, trim: true },
    telegram: { type: String, trim: true },
  },
  { _id: false }
);

const parcelSchema = new Schema<ParcelDoc>(
  {
    role: {
      type: String,
      required: true,
      enum: ["sender", "courier"],
      trim: true,
    },
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    parcelType: { type: String, required: true, trim: true },
    weightKg: { type: Number, min: 0, default: null },
    date: { type: String, trim: true, default: "" },
    availableDate: { type: String, trim: true, default: "" },
    vehicleType: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    contact: {
      type: contactSchema,
      required: true,
      validate: {
        validator(v: ParcelContact) {
          return Boolean(
            (v?.phone && v.phone.trim()) || (v?.telegram && v.telegram.trim())
          );
        },
        message: "Contact must include at least a phone number or Telegram handle",
      },
    },
    description: { type: String, trim: true, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        const out = ret as Record<string, unknown>;
        out.id = ret._id?.toString();
        delete out._id;
        delete out.__v;
        return out;
      },
    },
  }
);

parcelSchema.index({ from: "text", to: "text" });
parcelSchema.index({ createdAt: -1 });

export const Parcel: Model<ParcelDoc> =
  mongoose.models.Parcel ?? mongoose.model<ParcelDoc>("Parcel", parcelSchema);
