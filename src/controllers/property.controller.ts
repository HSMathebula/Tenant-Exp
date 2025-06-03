import type { Request, Response } from "express"
import Property from "../models/Property.model"
import Unit from "../models/Unit.model"
import Tenant from "../models/Tenant.model"
import Ticket from "../models/Ticket.model"
import Announcement from "../models/Announcement.model"
import mongoose from "mongoose"

// Get all properties
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const properties = await Property.find().populate("manager", "firstName lastName email")
    res.status(200).json(properties)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get property by ID
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id).populate("manager", "firstName lastName email")
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }
    res.status(200).json(property)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Create new property
export const createProperty = async (req: Request, res: Response) => {
  try {
    const { name, address, totalUnits, manager, description, amenities } = req.body

    const property = new Property({
      name,
      address,
      totalUnits,
      manager,
      description,
      amenities,
    })

    await property.save()
    res.status(201).json({ message: "Property created successfully", property })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Update property
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { name, address, totalUnits, manager, description, amenities, isActive } = req.body

    const property = await Property.findById(req.params.id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Update fields
    if (name) property.name = name
    if (address) property.address = address
    if (totalUnits) property.totalUnits = totalUnits
    if (manager) property.manager = manager
    if (description) property.description = description
    if (amenities) property.amenities = amenities
    if (isActive !== undefined) property.isActive = isActive

    await property.save()
    res.status(200).json({ message: "Property updated successfully", property })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Delete property
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Check if property has units
    const units = await Unit.find({ property: req.params.id })
    if (units.length > 0) {
      return res.status(400).json({ message: "Cannot delete property with existing units" })
    }

    await Property.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Property deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get units by property
export const getUnitsByProperty = async (req: Request, res: Response) => {
  try {
    const units = await Unit.find({ property: req.params.id })
    res.status(200).json(units)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Add image to property
export const addPropertyImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body

    const property = await Property.findById(req.params.id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    property.images = property.images || []
    property.images.push(imageUrl)

    await property.save()
    res.status(200).json({ message: "Image added successfully", property })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get property tenants
export const getPropertyTenants = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { limit = 10, page = 1 } = req.query

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid property ID" })
    }

    // Check if property exists
    const property = await Property.findById(id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Get units for this property
    const units = await Unit.find({ property: id }).select("_id")
    const unitIds = units.map((unit) => unit._id)

    // Pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Find tenants for these units
    const tenants = await Tenant.find({ unit: { $in: unitIds }, isActive: true })
      .populate("user", "firstName lastName email phone profileImage")
      .populate("unit", "unitNumber")
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 })

    // Get total count
    const total = await Tenant.countDocuments({ unit: { $in: unitIds }, isActive: true })

    res.status(200).json({
      tenants,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error("Get property tenants error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get property tickets
export const getPropertyTickets = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, priority, category, limit = 10, page = 1 } = req.query

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid property ID" })
    }

    // Check if property exists
    const property = await Property.findById(id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Build query
    const query: any = { property: id }

    // Filter by status if provided
    if (status) {
      query.status = status
    }

    // Filter by priority if provided
    if (priority) {
      query.priority = priority
    }

    // Filter by category if provided
    if (category) {
      query.category = category
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Execute query
    const tickets = await Ticket.find(query)
      .populate("tenant", "firstName lastName email")
      .populate("unit", "unitNumber")
      .populate("assignedTo", "firstName lastName")
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 })

    // Get total count
    const total = await Ticket.countDocuments(query)

    res.status(200).json({
      tickets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error("Get property tickets error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get property announcements
export const getPropertyAnnouncements = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { limit = 10, page = 1 } = req.query

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid property ID" })
    }

    // Check if property exists
    const property = await Property.findById(id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Get current date
    const currentDate = new Date()

    // Find active announcements for this property
    const announcements = await Announcement.find({
      property: id,
      startDate: { $lte: currentDate },
      $or: [{ endDate: { $gte: currentDate } }, { endDate: { $exists: false } }],
    })
      .populate("createdBy", "firstName lastName")
      .limit(Number(limit))
      .skip(skip)
      .sort({ isUrgent: -1, startDate: -1 })

    // Get total count
    const total = await Announcement.countDocuments({
      property: id,
      startDate: { $lte: currentDate },
      $or: [{ endDate: { $gte: currentDate } }, { endDate: { $exists: false } }],
    })

    res.status(200).json({
      announcements,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error("Get property announcements error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
