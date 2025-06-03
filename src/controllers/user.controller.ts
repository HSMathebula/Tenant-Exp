import type { Request, Response } from "express"
import User, { UserRole } from "../models/User.model"

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password")
    res.status(200).json(users)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json(user)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Create new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
    })

    await user.save()
    res.status(201).json({ message: "User created successfully", user: { ...user.toObject(), password: undefined } })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, isActive, role } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update fields
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (phone) user.phone = phone
    if (isActive !== undefined) user.isActive = isActive
    if (role) user.role = role

    await user.save()
    res.status(200).json({ message: "User updated successfully", user: { ...user.toObject(), password: undefined } })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "User deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get users by role
export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params

    // Validate role
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const users = await User.find({ role }).select("-password")
    res.status(200).json(users)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.params.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.status(200).json({ message: "Password changed successfully" })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
