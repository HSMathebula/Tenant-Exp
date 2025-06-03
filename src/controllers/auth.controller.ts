import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import User, { UserRole } from "../models/User.model"
import { sendEmail } from "../utils/email"
import crypto from "crypto"

// Generate JWT token
const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    },
  )
}

// Generate refresh token
const generateRefreshToken = (user: any) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    },
  )
}

// Login controller
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is inactive" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate tokens
    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    // Return user info and tokens
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImage: user.profileImage,
      },
      token,
      refreshToken,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Register controller
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body

    // Validate input
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" })
    }

    // Validate role
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({ message: "Invalid role" })
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

    // Generate tokens
    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    // Return user info and tokens
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      refreshToken,
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Forgot password controller
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res
        .status(200)
        .json({ message: "If your email exists in our system, you will receive a password reset link" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour

    // Save reset token to user
    user.resetToken = resetToken
    user.resetTokenExpiry = resetTokenExpiry
    await user.save()

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`,
      html: `<p>You requested a password reset.</p><p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    })

    res.status(200).json({ message: "If your email exists in our system, you will receive a password reset link" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Reset password controller
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body

    // Validate input
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" })
    }

    // Find user by reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    // Update password
    user.password = password
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    res.status(200).json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Refresh token controller
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string }

    // Find user
    const user = await User.findById(decoded.id)
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid token or inactive user" })
    }

    // Generate new tokens
    const newToken = generateToken(user)
    const newRefreshToken = generateRefreshToken(user)

    res.status(200).json({
      token: newToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.error("Refresh token error:", error)
    res.status(401).json({ message: "Invalid or expired refresh token" })
  }
}

// Logout controller
export const logout = async (req: Request, res: Response) => {
  // In a stateless JWT authentication system, the client is responsible for discarding the tokens
  // Server-side, we don't need to do anything special
  res.status(200).json({ message: "Logged out successfully" })
}
