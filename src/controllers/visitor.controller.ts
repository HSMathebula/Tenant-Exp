import type { Request, Response } from "express"
import VisitorAccess from "../models/VisitorAccess.model"
import User, { UserRole } from "../models/User.model"
import crypto from "crypto"

// Get all visitor access codes
export const getAllVisitorAccess = async (req: Request, res: Response) => {
  try {
    const visitorAccess = await VisitorAccess.find()
      .populate("tenant", "firstName lastName email")
      .populate("property", "name")
      .populate("unit", "unitNumber")

    res.status(200).json(visitorAccess)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get visitor access by ID
export const getVisitorAccessById = async (req: Request, res: Response) => {
  try {
    const visitorAccess = await VisitorAccess.findById(req.params.id)
      .populate("tenant", "firstName lastName email")
      .populate("property", "name")
      .populate("unit", "unitNumber")

    if (!visitorAccess) {
      return res.status(404).json({ message: "Visitor access not found" })
    }

    res.status(200).json(visitorAccess)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Create new visitor access
export const createVisitorAccess = async (req: Request, res: Response) => {
  try {
    const { tenantId, propertyId, unitId, visitorName, validFrom, validUntil, isOneTime, notes } = req.body

    // Check if tenant exists
    const tenant = await User.findById(tenantId)
    if (!tenant || tenant.role !== UserRole.TENANT) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Generate access code
    const accessCode = crypto.randomBytes(3).toString("hex").toUpperCase()

    const visitorAccess = new VisitorAccess({
      tenant: tenantId,
      property: propertyId,
      unit: unitId,
      visitorName,
      accessCode,
      validFrom: validFrom || new Date(),
      validUntil,
      isOneTime: isOneTime !== undefined ? isOneTime : true,
      notes,
    })

    await visitorAccess.save()
    res.status(201).json({ message: "Visitor access created successfully", visitorAccess })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Update visitor access
export const updateVisitorAccess = async (req: Request, res: Response) => {
  try {
    const { visitorName, validFrom, validUntil, isOneTime, isUsed, notes } = req.body

    const visitorAccess = await VisitorAccess.findById(req.params.id)
    if (!visitorAccess) {
      return res.status(404).json({ message: "Visitor access not found" })
    }

    // Update fields
    if (visitorName) visitorAccess.visitorName = visitorName
    if (validFrom) visitorAccess.validFrom = validFrom
    if (validUntil) visitorAccess.validUntil = validUntil
    if (isOneTime !== undefined) visitorAccess.isOneTime = isOneTime
    if (isUsed !== undefined) {
      visitorAccess.isUsed = isUsed
      if (isUsed) {
        visitorAccess.usedAt = new Date()
      } else {
        visitorAccess.usedAt = undefined
      }
    }
    if (notes !== undefined) visitorAccess.notes = notes

    await visitorAccess.save()
    res.status(200).json({ message: "Visitor access updated successfully", visitorAccess })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Delete visitor access
export const deleteVisitorAccess = async (req: Request, res: Response) => {
  try {
    const visitorAccess = await VisitorAccess.findById(req.params.id)
    if (!visitorAccess) {
      return res.status(404).json({ message: "Visitor access not found" })
    }

    await VisitorAccess.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Visitor access deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get visitor access by tenant
export const getVisitorAccessByTenant = async (req: Request, res: Response) => {
  try {
    const visitorAccess = await VisitorAccess.find({ tenant: req.params.tenantId })
      .populate("property", "name")
      .populate("unit", "unitNumber")

    res.status(200).json(visitorAccess)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Verify visitor access code
export const verifyVisitorAccessCode = async (req: Request, res: Response) => {
  try {
    const { accessCode } = req.body

    const visitorAccess = await VisitorAccess.findOne({ accessCode })
      .populate("tenant", "firstName lastName")
      .populate("property", "name")
      .populate("unit", "unitNumber")

    if (!visitorAccess) {
      return res.status(404).json({ message: "Invalid access code" })
    }

    const now = new Date()

    // Check if code is valid
    if (now < visitorAccess.validFrom || (visitorAccess.validUntil && now > visitorAccess.validUntil)) {
      return res.status(400).json({ message: "Access code is not valid at this time" })
    }

    // Check if code has been used (for one-time codes)
    if (visitorAccess.isOneTime && visitorAccess.isUsed) {
      return res.status(400).json({ message: "Access code has already been used" })
    }

    // Mark as used if one-time
    if (visitorAccess.isOneTime) {
      visitorAccess.isUsed = true
      visitorAccess.usedAt = now
      await visitorAccess.save()
    }

    res.status(200).json({
      message: "Access code verified successfully",
      visitorAccess: {
        visitorName: visitorAccess.visitorName,
        tenant: visitorAccess.tenant,
        property: visitorAccess.property,
        unit: visitorAccess.unit,
        validUntil: visitorAccess.validUntil,
        isOneTime: visitorAccess.isOneTime,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
