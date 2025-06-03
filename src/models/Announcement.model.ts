import mongoose, { Schema, type Document } from "mongoose"

export interface IAnnouncement extends Document {
  title: string
  content: string
  property: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  startDate: Date
  endDate?: Date
  isUrgent: boolean
  attachments?: string[]
}

const AnnouncementSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema)
