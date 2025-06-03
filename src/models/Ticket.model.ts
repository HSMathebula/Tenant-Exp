import mongoose, { Schema, type Document } from "mongoose"

export enum TicketCategory {
  PLUMBING = "plumbing",
  ELECTRICAL = "electrical",
  HVAC = "hvac",
  APPLIANCE = "appliance",
  STRUCTURAL = "structural",
  PEST = "pest",
  OTHER = "other",
}

export enum TicketPriority {
  LOW = "low",
  NORMAL = "normal",
  URGENT = "urgent",
  EMERGENCY = "emergency",
}

export enum TicketStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  WAITING_FOR_PARTS = "waiting_for_parts",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface ITicket extends Document {
  tenant: mongoose.Types.ObjectId
  property: mongoose.Types.ObjectId
  unit: mongoose.Types.ObjectId
  category: TicketCategory
  title: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  assignedTo?: mongoose.Types.ObjectId
  scheduledDate?: Date
  completedDate?: Date
  images?: string[]
  notes?: {
    user: mongoose.Types.ObjectId
    text: string
    createdAt: Date
  }[]
  accessInstructions?: string
  materialsUsed?: {
    item: string
    quantity: number
  }[]
  timeSpent?: number // in minutes
}

const TicketSchema: Schema = new Schema(
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
    category: {
      type: String,
      enum: Object.values(TicketCategory),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: Object.values(TicketPriority),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.PENDING,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    scheduledDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    images: [
      {
        type: String,
      },
    ],
    notes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    accessInstructions: {
      type: String,
      trim: true,
    },
    materialsUsed: [
      {
        item: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    timeSpent: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<ITicket>("Ticket", TicketSchema)
