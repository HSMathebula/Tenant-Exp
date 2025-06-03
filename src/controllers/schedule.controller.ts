import type { Request, Response } from "express"
import MaintenanceStaff from "../models/MaintenanceStaff.model"
import Ticket from "../models/Ticket.model"
import User, { UserRole } from "../models/User.model"

// Get maintenance staff schedule
export const getStaffSchedule = async (req: Request, res: Response) => {
  try {
    const staff = await MaintenanceStaff.findOne({ user: req.params.staffId })
      .populate("user", "firstName lastName email phone")
      .populate("properties", "name address")

    if (!staff) {
      return res.status(404).json({ message: "Maintenance staff not found" })
    }

    // Get assigned tickets
    const tickets = await Ticket.find({
      assignedTo: req.params.staffId,
      scheduledDate: { $exists: true },
    })
      .populate("property", "name")
      .populate("unit", "unitNumber")
      .populate("tenant", "firstName lastName")

    res.status(200).json({
      staff,
      tickets,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Update maintenance staff availability
export const updateStaffAvailability = async (req: Request, res: Response) => {
  try {
    const { availability, workingHours } = req.body

    const staff = await MaintenanceStaff.findOne({ user: req.params.staffId })
    if (!staff) {
      return res.status(404).json({ message: "Maintenance staff not found" })
    }

    if (availability) staff.availability = availability
    if (workingHours) staff.workingHours = workingHours

    await staff.save()
    res.status(200).json({ message: "Availability updated successfully", staff })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Assign ticket to maintenance staff
export const assignTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId, scheduledDate } = req.body

    // Check if staff exists
    const staff = await MaintenanceStaff.findOne({ user: req.params.staffId })
    if (!staff) {
      return res.status(404).json({ message: "Maintenance staff not found" })
    }

    // Check if ticket exists
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Update ticket
    ticket.assignedTo = staff.user
    ticket.scheduledDate = scheduledDate
    if (ticket.status === "pending") {
      ticket.status = "assigned"
    }

    await ticket.save()
    res.status(200).json({ message: "Ticket assigned successfully", ticket })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get all maintenance staff
export const getAllMaintenanceStaff = async (req: Request, res: Response) => {
  try {
    const staff = await MaintenanceStaff.find()
      .populate("user", "firstName lastName email phone")
      .populate("properties", "name")

    res.status(200).json(staff)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Create maintenance staff
export const createMaintenanceStaff = async (req: Request, res: Response) => {
  try {
    const { userId, properties, specialties, availability, workingHours } = req.body

    // Check if user exists and is maintenance staff
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.role !== UserRole.MAINTENANCE) {
      return res.status(400).json({ message: "User must have maintenance role" })
    }

    // Check if maintenance staff already exists for this user
    const existingStaff = await MaintenanceStaff.findOne({ user: userId })
    if (existingStaff) {
      return res.status(400).json({ message: "Maintenance staff already exists for this user" })
    }

    const staff = new MaintenanceStaff({
      user: userId,
      properties,
      specialties,
      availability,
      workingHours,
    })

    await staff.save()
    res.status(201).json({ message: "Maintenance staff created successfully", staff })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Update maintenance staff
export const updateMaintenanceStaff = async (req: Request, res: Response) => {
  try {
    const { properties, specialties, availability, workingHours, isActive } = req.body

    const staff = await MaintenanceStaff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ message: "Maintenance staff not found" })
    }

    if (properties) staff.properties = properties
    if (specialties) staff.specialties = specialties
    if (availability) staff.availability = availability
    if (workingHours) staff.workingHours = workingHours
    if (isActive !== undefined) staff.isActive = isActive

    await staff.save()
    res.status(200).json({ message: "Maintenance staff updated successfully", staff })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Delete maintenance staff
export const deleteMaintenanceStaff = async (req: Request, res: Response) => {
  try {
    const staff = await MaintenanceStaff.findById(req.params.id)
    if (!staff) {
      return res.status(404).json({ message: "Maintenance staff not found" })
    }

    // Check if staff has assigned tickets
    const tickets = await Ticket.find({ assignedTo: staff.user })
    if (tickets.length > 0) {
      return res.status(400).json({ message: "Cannot delete staff with assigned tickets" })
    }

    await MaintenanceStaff.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Maintenance staff deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
