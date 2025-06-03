import mongoose, { Schema, type Document } from "mongoose"

export enum PaymentType {
  RENT = "rent",
  SECURITY_DEPOSIT = "security_deposit",
  LATE_FEE = "late_fee",
  MAINTENANCE_FEE = "maintenance_fee",
  OTHER = "other",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  BANK_TRANSFER = "bank_transfer",
  CASH = "cash",
  CHECK = "check",
  OTHER = "other",
}

export interface IPayment extends Document {
  tenant: mongoose.Types.ObjectId
  property: mongoose.Types.ObjectId
  unit: mongoose.Types.ObjectId
  amount: number
  type: PaymentType
  status: PaymentStatus
  method: PaymentMethod
  dueDate?: Date
  paidDate?: Date
  transactionId?: string
  notes?: string
  receipt?: string
}

const PaymentSchema: Schema = new Schema(
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: Object.values(PaymentType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    dueDate: {
      type: Date,
    },
    paidDate: {
      type: Date,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    receipt: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IPayment>("Payment", PaymentSchema)
