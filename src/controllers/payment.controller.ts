import type { Request, Response } from "express"
import Payment, { PaymentStatus, PaymentType } from "../models/Payment.model"
import Tenant from "../models/Tenant.model"
import User, { UserRole } from "../models/User.model"

// Get all payments
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find()
      .populate("tenant", "firstName lastName email")
      .populate("property", "name")
      .populate("unit", "unitNumber")

    res.status(200).json(payments)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("tenant", "firstName lastName email")
      .populate("property", "name")
      .populate("unit", "unitNumber")

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    res.status(200).json(payment)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Create new payment
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { tenantId, propertyId, unitId, amount, type, method, dueDate, notes } = req.body

    // Check if tenant exists
    const tenant = await User.findById(tenantId)
    if (!tenant || tenant.role !== UserRole.TENANT) {
      return res.status(404).json({ message: "Tenant not found" })
    }

    const payment = new Payment({
      tenant: tenantId,
      property: propertyId,
      unit: unitId,
      amount,
      type,
      status: PaymentStatus.PENDING,
      method,
      dueDate,
      notes,
    })

    await payment.save()
    res.status(201).json({ message: "Payment created successfully", payment })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Update payment
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { amount, type, status, method, dueDate, paidDate, transactionId, notes } = req.body

    const payment = await Payment.findById(req.params.id)
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Update fields
    if (amount) payment.amount = amount
    if (type) payment.type = type
    if (status) {
      payment.status = status
      // If status is completed, set paidDate if not already set
      if (status === PaymentStatus.COMPLETED && !payment.paidDate) {
        payment.paidDate = new Date()
      }
    }
    if (method) payment.method = method
    if (dueDate) payment.dueDate = dueDate
    if (paidDate) payment.paidDate = paidDate
    if (transactionId) payment.transactionId = transactionId
    if (notes !== undefined) payment.notes = notes

    await payment.save()
    res.status(200).json({ message: "Payment updated successfully", payment })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Delete payment
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id)
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    await Payment.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Payment deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get payments by tenant
export const getPaymentsByTenant = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({ tenant: req.params.tenantId })
      .populate("property", "name")
      .populate("unit", "unitNumber")
      .sort({ dueDate: -1 })

    res.status(200).json(payments)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get payments by property
export const getPaymentsByProperty = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({ property: req.params.propertyId })
      .populate("tenant", "firstName lastName")
      .populate("unit", "unitNumber")
      .sort({ dueDate: -1 })

    res.status(200).json(payments)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get payments by status
export const getPaymentsByStatus = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({ status: req.params.status })
      .populate("tenant", "firstName lastName")
      .populate("property", "name")
      .populate("unit", "unitNumber")
      .sort({ dueDate: -1 })

    res.status(200).json(payments)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Process payment
export const processPayment = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body

    const payment = await Payment.findById(req.params.id)
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    payment.status = PaymentStatus.COMPLETED
    payment.paidDate = new Date()
    payment.transactionId = transactionId

    await payment.save()
    res.status(200).json({ message: "Payment processed successfully", payment })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Generate rent payments for all active tenants
export const generateRentPayments = async (req: Request, res: Response) => {
  try {
    const { dueDate } = req.body

    // Get all active tenants
    const tenants = await Tenant.find({ isActive: true }).populate("user").populate("unit")

    const payments = []

    for (const tenant of tenants) {
      // Create rent payment
      const payment = new Payment({
        tenant: tenant.user._id,
        property: tenant.unit.property,
        unit: tenant.unit._id,
        amount: tenant.rentAmount,
        type: PaymentType.RENT,
        status: PaymentStatus.PENDING,
        method: null,
        dueDate: dueDate || new Date(),
      })

      await payment.save()
      payments.push(payment)
    }

    res.status(201).json({
      message: `Generated ${payments.length} rent payments successfully`,
      count: payments.length,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
