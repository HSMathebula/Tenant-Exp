import mongoose, { Schema, type Document } from "mongoose"
import crypto from "crypto"

export interface IVisitorAccess extends Document {
  tenant: mongoose.Types.ObjectId
  property: mongoose.Types.ObjectId
  unit: mongoose.Types.ObjectId
  visitorName: string
  accessCode: string
  validFrom: Date
  validUntil: Date
  isOneTime: boolean
  isUsed: boolean
  usedAt?: Date
  notes?: string
}

const VisitorAccessSchema: Schema = new Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    visitorName: {
      type: String,
      required: true,
      trim: true,
    },
    accessCode: {
      type: String,
      required: true,
      unique: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isOneTime: {
      type: Boolean,
      default: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Generate a random access code before saving
VisitorAccessSchema.pre<IVisitorAccess>("save", function (next) {
  if (!this.isModified("accessCode")) {
    this.accessCode = crypto.randomBytes(3).toString("hex").toUpperCase()
  }
  next()
})

export default mongoose.model<IVisitorAccess>("VisitorAccess", VisitorAccessSchema)
