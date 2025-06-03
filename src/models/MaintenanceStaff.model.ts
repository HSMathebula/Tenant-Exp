import mongoose, { Schema, type Document } from "mongoose"

export interface IMaintenanceStaff extends Document {
  user: mongoose.Types.ObjectId
  properties: mongoose.Types.ObjectId[]
  specialties: string[]
  availability: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  workingHours: {
    start: string
    end: string
  }
  isActive: boolean
}

const MaintenanceStaffSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    properties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    availability: {
      monday: {
        type: Boolean,
        default: true,
      },
      tuesday: {
        type: Boolean,
        default: true,
      },
      wednesday: {
        type: Boolean,
        default: true,
      },
      thursday: {
        type: Boolean,
        default: true,
      },
      friday: {
        type: Boolean,
        default: true,
      },
      saturday: {
        type: Boolean,
        default: false,
      },
      sunday: {
        type: Boolean,
        default: false,
      },
    },
    workingHours: {
      start: {
        type: String,
        default: "09:00",
      },
      end: {
        type: String,
        default: "17:00",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IMaintenanceStaff>("MaintenanceStaff", MaintenanceStaffSchema)
