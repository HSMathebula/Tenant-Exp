import mongoose, { Schema, type Document } from "mongoose"

export enum UnitStatus {
  VACANT = "vacant",
  OCCUPIED = "occupied",
  MAINTENANCE = "maintenance",
}

export interface IUnit extends Document {
  property: mongoose.Types.ObjectId
  unitNumber: string
  floor?: number
  bedrooms: number
  bathrooms: number
  squareFootage: number
  rent: number
  status: UnitStatus
  features?: string[]
  images?: string[]
}

const UnitSchema: Schema = new Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    unitNumber: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: Number,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    squareFootage: {
      type: Number,
      required: true,
      min: 0,
    },
    rent: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(UnitStatus),
      default: UnitStatus.VACANT,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure unitNumber is unique per property
UnitSchema.index({ property: 1, unitNumber: 1 }, { unique: true })

export default mongoose.model<IUnit>("Unit", UnitSchema)
