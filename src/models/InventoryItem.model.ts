import mongoose, { Schema, type Document } from "mongoose"

export interface IInventoryItem extends Document {
  name: string
  category: string
  description?: string
  quantity: number
  unit: string
  minQuantity: number
  cost: number
  supplier?: string
  location?: string
  image?: string
}

const InventoryItemSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    minQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    supplier: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IInventoryItem>("InventoryItem", InventoryItemSchema)
