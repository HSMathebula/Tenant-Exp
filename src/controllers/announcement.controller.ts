import type { Request, Response } from "express"
import Announcement from "../models/Announcement.model"
import Property from "../models/Property.model"
import User, { UserRole } from "../models/User.model"

// Get all announcements
export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await Announcement.find()
      .populate("property", "name")
      .populate("createdBy", "firstName lastName")

    res.status(200).json(announcements)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get announcement by ID
export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("property", "name")
      .populate("createdBy", "firstName lastName")

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    res.status(200).json(announcement)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Create new announcement
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, propertyId, createdById, startDate, endDate, isUrgent } = req.body

    // Check if property exists
    const property = await Property.findById(propertyId)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Check if user exists and is admin
    const user = await User.findById(createdById)
    if (!user || user.role !== UserRole.ADMIN) {
      return res.status(404).json({ message: "User not found or not authorized" })
    }

    const announcement = new Announcement({
      title,
      content,
      property: propertyId,
      createdBy: createdById,
      startDate: startDate || new Date(),
      endDate,
      isUrgent: isUrgent || false,
    })

    await announcement.save()
    res.status(201).json({ message: "Announcement created successfully", announcement })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Update announcement
export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, startDate, endDate, isUrgent } = req.body

    const announcement = await Announcement.findById(req.params.id)
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    // Update fields
    if (title) announcement.title = title
    if (content) announcement.content = content
    if (startDate) announcement.startDate = startDate
    if (endDate !== undefined) announcement.endDate = endDate
    if (isUrgent !== undefined) announcement.isUrgent = isUrgent

    await announcement.save()
    res.status(200).json({ message: "Announcement updated successfully", announcement })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Delete announcement
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    await Announcement.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Announcement deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get announcements by property
export const getAnnouncementsByProperty = async (req: Request, res: Response) => {
  try {
    const announcements = await Announcement.find({
      property: req.params.propertyId,
      startDate: { $lte: new Date() },
      $or: [{ endDate: { $gte: new Date() } }, { endDate: { $exists: false } }],
    })
      .populate("createdBy", "firstName lastName")
      .sort({ isUrgent: -1, startDate: -1 })

    res.status(200).json(announcements)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Add attachment to announcement
export const addAnnouncementAttachment = async (req: Request, res: Response) => {
  try {
    const { attachmentUrl } = req.body

    const announcement = await Announcement.findById(req.params.id)
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    announcement.attachments = announcement.attachments || []
    announcement.attachments.push(attachmentUrl)

    await announcement.save()
    res.status(200).json({ message: "Attachment added successfully", announcement })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
