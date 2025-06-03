import type { Request, Response } from "express"
import Ticket, { TicketStatus, TicketPriority, TicketCategory } from "../models/Ticket.model"
import User, { UserRole } from "../models/User.model"
import Tenant from "../models/Tenant.model"
import Unit from "../models/Unit.model"
import MaintenanceStaff from "../models/MaintenanceStaff.model"
import mongoose from "mongoose"
import InventoryItem from "../models/InventoryItem.model"

// Get all tickets
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await Ticket.find()
      .populate("tenant", "firstName lastName email")
      .populate("property", "name")
      .populate("unit", "unitNumber")
      .populate("assignedTo", "firstName lastName")

    res.status(200).json(tickets)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get ticket by ID
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("tenant", "firstName lastName email")
      .populate("property", "name")
      .populate("unit", "unitNumber")
      .populate("assignedTo", "firstName lastName")
      .populate("notes.user", "firstName lastName")

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    res.status(200).json(ticket)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Create new ticket
export const createTicket = async (req: Request, res: Response) => {
  try {
    const { tenantId, propertyId, unitId, category, title, description, priority, accessInstructions } = req.body

    // Check if tenant exists
    const tenant = await User.findById(tenantId)
    if (!tenant || tenant.role !== UserRole.TENANT) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    const ticket = new Ticket({
      tenant: tenantId,
      property: propertyId,
      unit: unitId,
      category,
      title,
      description,
      priority,
      status: TicketStatus.PENDING,
      accessInstructions,
    })

    await ticket.save()
    res.status(201).json({ message: "Ticket created successfully", ticket })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Update ticket
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { category, title, description, priority, status, assignedTo, scheduledDate, accessInstructions } = req.body

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Update fields
    if (category) ticket.category = category
    if (title) ticket.title = title
    if (description) ticket.description = description
    if (priority) ticket.priority = priority
    if (status) {
      ticket.status = status
      // If status is completed, set completedDate
      if (status === TicketStatus.COMPLETED) {
        ticket.completedDate = new Date()
      }
    }
    if (assignedTo) {
      // Check if assigned user is maintenance staff
      const staff = await MaintenanceStaff.findOne({ user: assignedTo })
      if (!staff) {
        return res.status(400).json({ message: "Assigned user must be maintenance staff" })
      }
      ticket.assignedTo = assignedTo
      // If assigning, update status to assigned if it's pending
      if (ticket.status === TicketStatus.PENDING) {
        ticket.status = TicketStatus.ASSIGNED
      }
    }
    if (scheduledDate) ticket.scheduledDate = scheduledDate
    if (accessInstructions) ticket.accessInstructions = accessInstructions

    await ticket.save()
    res.status(200).json({ message: "Ticket updated successfully", ticket })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Delete ticket
export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    await Ticket.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Ticket deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Add note to ticket
export const addTicketNote = async (req: Request, res: Response) => {
  try {
    const { userId, text } = req.body

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    ticket.notes = ticket.notes || []
    ticket.notes.push({
      user: userId,
      text,
      createdAt: new Date(),
    })

    await ticket.save()
    res.status(200).json({ message: "Note added successfully", ticket })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Add image to ticket
export const addTicketImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    ticket.images = ticket.images || []
    ticket.images.push(imageUrl)

    await ticket.save()
    res.status(200).json({ message: "Image added successfully", ticket })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Add materials used to ticket
export const addTicketMaterials = async (req: Request, res: Response) => {
  try {
    const { materials } = req.body

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Update inventory quantities
    for (const material of materials) {
      const inventoryItem = await InventoryItem.findOne({ name: material.item })
      if (inventoryItem) {
        inventoryItem.quantity = Math.max(0, inventoryItem.quantity - material.quantity)
        await inventoryItem.save()
      }
    }

    ticket.materialsUsed = materials
    await ticket.save()

    res.status(200).json({ message: "Materials added successfully", ticket })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get tickets by tenant
export const getTicketsByTenant = async (req: Request, res: Response) => {
  try {
    const tickets = await Ticket.find({ tenant: req.params.tenantId })
      .populate("property", "name")
      .populate("unit", "unitNumber")
      .populate("assignedTo", "firstName lastName")

    res.status(200).json(tickets)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get tickets by property
export const getTicketsByProperty = async (req: Request, res: Response) => {
  try {
    const tickets = await Ticket.find({ property: req.params.propertyId })
      .populate("tenant", "firstName lastName")
      .populate("unit", "unitNumber")
      .populate("assignedTo", "firstName lastName")

    res.status(200).json(tickets)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get tickets by maintenance staff
export const getTicketsByStaff = async (req: Request, res: Response) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.params.staffId })
      .populate("tenant", "firstName lastName")
      .populate("property", "name")
      .populate("unit", "unitNumber")

    res.status(200).json(tickets)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get all tickets (admin and maintenance)
export const getTickets = async (req: Request, res: Response) => {
  try {
    const { status, priority, category, property, assignedTo, search, limit = 10, page = 1 } = req.query

    // Build query
    const query: any = {}

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

    // Filter by property if provided
    if (property) {
      query.property = property
    }

    // Filter by assigned staff if provided
    if (assignedTo) {
      query.assignedTo = assignedTo
    }

    // If maintenance staff, only show tickets assigned to them or unassigned
    if (req.user.role === UserRole.MAINTENANCE) {
      query.$or = [{ assignedTo: req.user.id }, { assignedTo: { $exists: false } }]

      // Also filter by properties they are assigned to
      const staffMember = await MaintenanceStaff.findOne({ user: req.user.id })
      if (staffMember && staffMember.properties.length > 0) {
        query.property = { $in: staffMember.properties }
      }
    }

    // Search by title or description
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Execute query
    const tickets = await Ticket.find(query)
      .populate("tenant", "firstName lastName email")
      .populate("property", "name")
      .populate("unit", "unitNumber")
      .populate("assignedTo", "firstName lastName")
      .limit(Number(limit))
      .skip(skip)
      .sort({ priority: 1, createdAt: -1 }) // Sort by priority (highest first) then by date

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
    console.error("Get tickets error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create ticket (tenant only)
export const createTicketTenant = async (req: Request, res: Response) => {
  try {
    const { category, title, description, priority, images, accessInstructions } = req.body

    // Validate required fields
    if (!category || !title || !description || !priority) {
      return res.status(400).json({ message: "Category, title, description, and priority are required" })
    }

    // Validate category
    if (!Object.values(TicketCategory).includes(category as TicketCategory)) {
      return res.status(400).json({ message: "Invalid category" })
    }

    // Validate priority
    if (!Object.values(TicketPriority).includes(priority as TicketPriority)) {
      return res.status(400).json({ message: "Invalid priority" })
    }

    // Find tenant
    const tenant = await Tenant.findOne({ user: req.user.id, isActive: true })
    if (!tenant) {
      return res.status(404).json({ message: "Active tenant record not found" })
    }

    // Get unit and property
    const unit = await Unit.findById(tenant.unit)
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" })
    }

    // Create new ticket
    const ticket = new Ticket({
      tenant: req.user.id,
      property: unit.property,
      unit: unit._id,
      category,
      title,
      description,
      priority,
      status: TicketStatus.PENDING,
      images,
      accessInstructions,
    })

    await ticket.save()

    res.status(201).json(ticket)
  } catch (error) {
    console.error("Create ticket error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Assign ticket to maintenance staff (admin only)
export const assignTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { staffId, scheduledDate } = req.body

    // Check if IDs are valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ticket ID" })
    }
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: "Invalid staff ID" })
    }

    // Find ticket
    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Find staff member
    const staff = await User.findById(staffId)
    if (!staff || staff.role !== UserRole.MAINTENANCE) {
      return res.status(404).json({ message: "Maintenance staff not found" })
    }

    // Check if staff is assigned to this property
    const staffMember = await MaintenanceStaff.findOne({ user: staffId })
    if (!staffMember) {
      return res.status(404).json({ message: "Maintenance staff record not found" })
    }

    const isAssignedToProperty = staffMember.properties.some((p) => p.toString() === ticket.property.toString())
    if (!isAssignedToProperty) {
      return res.status(400).json({ message: "Staff is not assigned to this property" })
    }

    // Update ticket
    ticket.assignedTo = staffId
    ticket.status = TicketStatus.ASSIGNED
    if (scheduledDate) {
      ticket.scheduledDate = new Date(scheduledDate)
    }

    // Add note about assignment
    ticket.notes.push({
      user: req.user.id,
      text: `Ticket assigned to ${staff.firstName} ${staff.lastName}${
        scheduledDate ? ` and scheduled for ${new Date(scheduledDate).toLocaleDateString()}` : ""
      }`,
      createdAt: new Date(),
    })

    await ticket.save()

    res.status(200).json(ticket)
  } catch (error) {
    console.error("Assign ticket error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Upload ticket image (tenant only)
export const uploadTicketImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { imageUrl } = req.body

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ticket ID" })
    }

    // Validate input
    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" })
    }

    // Find ticket
    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Check if user is the tenant who created the ticket
    if (ticket.tenant.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to upload images to this ticket" })
    }

    // Add image
    if (!ticket.images) {
      ticket.images = []
    }
    ticket.images.push(imageUrl)

    await ticket.save()

    res.status(200).json({
      message: "Image uploaded successfully",
      images: ticket.images,
    })
  } catch (error) {
    console.error("Upload ticket image error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete ticket image (admin and maintenance)
export const deleteTicketImage = async (req: Request, res: Response) => {
  try {
    const { id, imageId } = req.params

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ticket ID" })
    }

    // Find ticket
    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Check if image exists
    if (!ticket.images || ticket.images.length === 0) {
      return res.status(404).json({ message: "No images found for this ticket" })
    }

    // Remove image
    ticket.images = ticket.images.filter((img) => img !== imageId)
    await ticket.save()

    res.status(200).json({
      message: "Image deleted successfully",
      images: ticket.images,
    })
  } catch (error) {
    console.error("Delete ticket image error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Complete ticket (admin and maintenance)
export const completeTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { materialsUsed, timeSpent, notes } = req.body

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ticket ID" })
    }

    // Find ticket
    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Check if ticket is assigned to this maintenance staff
    if (
      req.user.role === UserRole.MAINTENANCE &&
      (!ticket.assignedTo || ticket.assignedTo.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: "Not authorized to complete this ticket" })
    }

    // Update ticket
    ticket.status = TicketStatus.COMPLETED
    ticket.completedDate = new Date()

    if (materialsUsed) {
      ticket.materialsUsed = materialsUsed
    }

    if (timeSpent) {
      ticket.timeSpent = timeSpent
    }

    // Add completion note
    ticket.notes.push({
      user: req.user.id,
      text: notes || "Ticket marked as completed",
      createdAt: new Date(),
    })

    await ticket.save()

    res.status(200).json({
      message: "Ticket completed successfully",
      ticket,
    })
  } catch (error) {
    console.error("Complete ticket error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Cancel ticket (admin only)
export const cancelTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ticket ID" })
    }

    // Validate input
    if (!reason) {
      return res.status(400).json({ message: "Cancellation reason is required" })
    }

    // Find ticket
    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Update ticket
    ticket.status = TicketStatus.CANCELLED

    // Add cancellation note
    ticket.notes.push({
      user: req.user.id,
      text: `Ticket cancelled: ${reason}`,
      createdAt: new Date(),
    })

    await ticket.save()

    res.status(200).json({
      message: "Ticket cancelled successfully",
      ticket,
    })
  } catch (error) {
    console.error("Cancel ticket error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
