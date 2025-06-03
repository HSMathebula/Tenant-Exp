import mongoose, { Schema, type Document } from "mongoose"

export interface ITenant extends Document {
  user: mongoose.Types.ObjectId
  unit: mongoose.Types.ObjectId
  leaseStart: Date
  leaseEnd: Date
  rentAmount: number
  securityDeposit: number
  occupants: number
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  documents?: string[]
  isActive: boolean
}

const TenantSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    leaseStart: {
      type: Date,
      required: true,
    },
    leaseEnd: {
      type: Date,
      required: true,
    },
    rentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },
    occupants: {
      type: Number,
      required: true,
      min: 1,
    },
    emergencyContact: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      relationship: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },
    documents: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<ITenant>("Tenant", TenantSchema)
