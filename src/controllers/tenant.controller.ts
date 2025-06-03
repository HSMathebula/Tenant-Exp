import type { Request, Response } from "express"
import Tenant from "../models/Tenant.model"
import User, { UserRole } from "../models/User.model"
import Unit, { UnitStatus } from "../models/Unit.model"
import Ticket from "../models/Ticket.model"
import Payment from "../models/Payment.model"
import mongoose from "mongoose"

// Get all tenants
export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await Tenant.find()
      .populate("user", "firstName lastName email phone")
      .populate({
        path: "unit",
        populate: {
          path: "property",
          select: "name address",
        },
      })
    res.status(200).json(tenants)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get tenant by ID
export const getTenantById = async (req: Request, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate("user", "firstName lastName email phone")
      .populate({
        path: "unit",
        populate: {
          path: "property",
          select: "name address",
        },
      })

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    res.status(200).json(tenant)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Create new tenant
export const createTenant = async (req: Request, res: Response) => {
  try {
    const { userId, unitId, leaseStart, leaseEnd, rentAmount, securityDeposit, occupants, emergencyContact } = req.body

    // Check if user exists and is a tenant
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.role !== UserRole.TENANT) {
      return res.status(400).json({ message: "User must have tenant role" })
    }

    // Check if unit exists and is vacant
    const unit = await Unit.findById(unitId)
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" })
    }

    if (unit.status !== UnitStatus.VACANT) {
      return res.status(400).json({ message: "Unit is not vacant" })
    }

    // Check if tenant already exists for this user
    const existingTenant = await Tenant.findOne({ user: userId })
    if (existingTenant) {
      return res.status(400).json({ message: "Tenant already exists for this user" })
    }

    // Create tenant
    const tenant = new Tenant({
      user: userId,
      unit: unitId,
      leaseStart,
      leaseEnd,
      rentAmount,
      securityDeposit,
      occupants,
      emergencyContact,
    })

    await tenant.save()

    // Update unit status to occupied
    unit.status = UnitStatus.OCCUPIED
    await unit.save()

    res.status(201).json({ message: "Tenant created successfully", tenant })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Update tenant
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const { leaseStart, leaseEnd, rentAmount, securityDeposit, occupants, emergencyContact, isActive } = req.body

    const tenant = await Tenant.findById(req.params.id)
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Update fields
    if (leaseStart) tenant.leaseStart = leaseStart
    if (leaseEnd) tenant.leaseEnd = leaseEnd
    if (rentAmount) tenant.rentAmount = rentAmount
    if (securityDeposit) tenant.securityDeposit = securityDeposit
    if (occupants) tenant.occupants = occupants
    if (emergencyContact) tenant.emergencyContact = emergencyContact
    if (isActive !== undefined) tenant.isActive = isActive

    await tenant.save()
    res.status(200).json({ message: "Tenant updated successfully", tenant })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Delete tenant
export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Update unit status to vacant
    const unit = await Unit.findById(tenant.unit)
    if (unit) {
      unit.status = UnitStatus.VACANT
      await unit.save()
    }

    await Tenant.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Tenant deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get tenant by user ID
export const getTenantByUserId = async (req: Request, res: Response) => {
  try {
    const tenant = await Tenant.findOne({ user: req.params.userId })
      .populate("user", "firstName lastName email phone")
      .populate({
        path: "unit",
        populate: {
          path: "property",
          select: "name address",
        },
      })

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    res.status(200).json(tenant)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Add document to tenant
export const addTenantDocument = async (req: Request, res: Response) => {
  try {
    const { documentUrl } = req.body

    const tenant = await Tenant.findById(req.params.id)
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    tenant.documents = tenant.documents || []
    tenant.documents.push(documentUrl)

    await tenant.save()
    res.status(200).json({ message: "Document added successfully", tenant })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get all tenants (admin only)
export const getTenants = async (req: Request, res: Response) => {
  try {
    const { search, property, isActive = true, limit = 10, page = 1 } = req.query

    // Build query
    const query: any = {}

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === "true"
    }

    // Filter by property if provided
    if (property) {
      // Get units for this property
      const units = await Unit.find({ property }).select("_id")
      const unitIds = units.map((unit) => unit._id)
      query.unit = { $in: unitIds }
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Execute query with search
    let tenants

    if (search) {
      // Find users matching the search
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
        role: UserRole.TENANT,
      }).select("_id")

      const userIds = users.map((user) => user._id)
      query.user = { $in: userIds }
    }

    // Execute query
    tenants = await Tenant.find(query)
      .populate("user", "firstName lastName email phone profileImage")
      .populate({
        path: "unit",
        select: "unitNumber property",
        populate: {
          path: "property",
          select: "name",
        },
      })
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 })

    // Get total count
    const total = await Tenant.countDocuments(query)

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
    console.error("Get tenants error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get tenant by ID
// export const getTenantById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params

//     // Check if ID is valid
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid tenant ID" })
//     }

//     const tenant = await Tenant.findById(id)
//       .populate("user", "firstName lastName email phone profileImage")
//       .populate({
//         path: "unit",
//         select: "unitNumber property bedrooms bathrooms squareFootage rent",
//         populate: {
//           path: "property",
//           select: "name address",
//         },
//       })

//     if (!tenant) {
//       return res.status(404).json({ message: "Tenant not found" })
//     }

//     // Check if user is authorized to view this tenant
//     if (req.user.role !== UserRole.ADMIN && req.user.id !== tenant.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized to view this tenant" })
//     }

//     res.status(200).json(tenant)
//   } catch (error) {
//     console.error("Get tenant error:", error)
//     res.status(500).json({ message: "Server error" })
//   }
// }

// Create tenant (admin only)
// export const createTenant = async (req: Request, res: Response) => {
//   try {
//     const {
//       userId,
//       unitId,
//       leaseStart,
//       leaseEnd,
//       rentAmount,
//       securityDeposit,
//       occupants,
//       emergencyContact,
//       documents,
//     } = req.body

//     // Validate required fields
//     if (!userId || !unitId || !leaseStart || !leaseEnd || !rentAmount || !securityDeposit || !occupants) {
//       return res.status(400).json({
//         message:
//           "User ID, unit ID, lease start/end dates, rent amount, security deposit, and occupants count are required",
//       })
//     }

//     // Validate emergency contact
//     if (!emergencyContact || !emergencyContact.name || !emergencyContact.relationship || !emergencyContact.phone) {
//       return res.status(400).json({
//         message: "Emergency contact with name, relationship, and phone is required",
//       })
//     }

//     // Check if user exists and is a tenant
//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }
//     if (user.role !== UserRole.TENANT) {
//       return res.status(400).json({ message: "User must have tenant role" })
//     }

//     // Check if unit exists
//     const unit = await Unit.findById(unitId)
//     if (!unit) {
//       return res.status(404).json({ message: "Unit not found" })
//     }

//     // Check if unit is available
//     if (unit.status !== UnitStatus.VACANT) {
//       return res.status(400).json({ message: "Unit is not available for rent" })
//     }

//     // Check if user is already a tenant
//     const existingTenant = await Tenant.findOne({ user: userId, isActive: true })
//     if (existingTenant) {
//       return res.status(400).json({ message: "User is already an active tenant" })
//     }

//     // Create new tenant
//     const tenant = new Tenant({
//       user: userId,
//       unit: unitId,
//       leaseStart,
//       leaseEnd,
//       rentAmount,
//       securityDeposit,
//       occupants,
//       emergencyContact,
//       documents,
//     })

//     await tenant.save()

//     // Update unit status
//     unit.status = UnitStatus.OCCUPIED
//     await unit.save()

//     res.status(201).json(tenant)
//   } catch (error) {
//     console.error("Create tenant error:", error)
//     res.status(500).json({ message: "Server error" })
//   }
// }

// Update tenant (admin only)
// export const updateTenant = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params
//     const { leaseStart, leaseEnd, rentAmount, securityDeposit, occupants, emergencyContact, documents } = req.body

//     // Check if ID is valid
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid tenant ID" })
//     }

//     // Find tenant
//     const tenant = await Tenant.findById(id)

//     if (!tenant) {
//       return res.status(404).json({ message: "Tenant not found" })
//     }

//     // Update fields
//     if (leaseStart) tenant.leaseStart = leaseStart
//     if (leaseEnd) tenant.leaseEnd = leaseEnd
//     if (rentAmount) tenant.rentAmount = rentAmount
//     if (securityDeposit) tenant.securityDeposit = securityDeposit
//     if (occupants) tenant.occupants = occupants
//     if (emergencyContact) {
//       if (emergencyContact.name) tenant.emergencyContact.name = emergencyContact.name
//       if (emergencyContact.relationship) tenant.emergencyContact.relationship = emergencyContact.relationship
//       if (emergencyContact.phone) tenant.emergencyContact.phone = emergencyContact.phone
//     }
//     if (documents) tenant.documents = documents

//     await tenant.save()

//     res.status(200).json(tenant)
//   } catch (error) {
//     console.error("Update tenant error:", error)
//     res.status(500).json({ message: "Server error" })
//   }
// }

// Deactivate tenant (admin only)
export const deactivateTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tenant ID" })
    }

    // Find tenant
    const tenant = await Tenant.findById(id)

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Deactivate tenant
    tenant.isActive = false
    await tenant.save()

    // Update unit status
    const unit = await Unit.findById(tenant.unit)
    if (unit) {
      unit.status = UnitStatus.VACANT
      await unit.save()
    }

    res.status(200).json({ message: "Tenant deactivated successfully" })
  } catch (error) {
    console.error("Deactivate tenant error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get tenant tickets
export const getTenantTickets = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, limit = 10, page = 1 } = req.query

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tenant ID" })
    }

    // Find tenant
    const tenant = await Tenant.findById(id)

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Check if user is authorized to view this tenant's tickets
    if (req.user.role !== UserRole.ADMIN && req.user.id !== tenant.user.toString()) {
      return res.status(403).json({ message: "Not authorized to view this tenant's tickets" })
    }

    // Build query
    const query: any = { tenant: tenant.user }

    // Filter by status if provided
    if (status) {
      query.status = status
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Execute query
    const tickets = await Ticket.find(query)
      .populate("assignedTo", "firstName lastName")
      .populate("unit", "unitNumber")
      .populate("property", "name")
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
    console.error("Get tenant tickets error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get tenant payments
export const getTenantPayments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, type, limit = 10, page = 1 } = req.query

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tenant ID" })
    }

    // Find tenant
    const tenant = await Tenant.findById(id)

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Check if user is authorized to view this tenant's payments
    if (req.user.role !== UserRole.ADMIN && req.user.id !== tenant.user.toString()) {
      return res.status(403).json({ message: "Not authorized to view this tenant's payments" })
    }

    // Build query
    const query: any = { tenant: tenant.user }

    // Filter by status if provided
    if (status) {
      query.status = status
    }

    // Filter by type if provided
    if (type) {
      query.type = type
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Execute query
    const payments = await Payment.find(query)
      .populate("unit", "unitNumber")
      .populate("property", "name")
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 })

    // Get total count
    const total = await Payment.countDocuments(query)

    res.status(200).json({
      payments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error("Get tenant payments error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get tenant documents
export const getTenantDocuments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tenant ID" })
    }

    // Find tenant
    const tenant = await Tenant.findById(id)

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Check if user is authorized to view this tenant's documents
    if (req.user.role !== UserRole.ADMIN && req.user.id !== tenant.user.toString()) {
      return res.status(403).json({ message: "Not authorized to view this tenant's documents" })
    }

    res.status(200).json({ documents: tenant.documents || [] })
  } catch (error) {
    console.error("Get tenant documents error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Upload tenant document (admin only)
export const uploadTenantDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { documentUrl, documentName } = req.body

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tenant ID" })
    }

    // Validate input
    if (!documentUrl || !documentName) {
      return res.status(400).json({ message: "Document URL and name are required" })
    }

    // Find tenant
    const tenant = await Tenant.findById(id)

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Add document
    const document = {
      url: documentUrl,
      name: documentName,
      uploadedAt: new Date(),
    }

    if (!tenant.documents) {
      tenant.documents = []
    }

    tenant.documents.push(document)
    await tenant.save()

    res.status(200).json({
      message: "Document uploaded successfully",
      document,
    })
  } catch (error) {
    console.error("Upload tenant document error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete tenant document (admin only)
export const deleteTenantDocument = async (req: Request, res: Response) => {
  try {
    const { id, documentId } = req.params

    // Check if IDs are valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tenant ID" })
    }

    // Find tenant
    const tenant = await Tenant.findById(id)

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    // Check if document exists
    if (!tenant.documents || !tenant.documents.some((doc: any) => doc._id.toString() === documentId)) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Remove document
    tenant.documents = tenant.documents.filter((doc: any) => doc._id.toString() !== documentId)
    await tenant.save()

    res.status(200).json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("Delete tenant document error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
