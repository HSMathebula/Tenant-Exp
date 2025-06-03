import mongoose, { Schema, type Document } from "mongoose"

export interface IProperty extends Document {
  name: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  totalUnits: number
  manager: mongoose.Types.ObjectId
  description?: string
  amenities?: string[]
  images?: string[]
  isActive: boolean
}

const PropertySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: "USA",
      },
    },
    totalUnits: {
      type: Number,
      required: true,
      min: 1,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    amenities: [
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IProperty>("Property", PropertySchema)
