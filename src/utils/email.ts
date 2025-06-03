import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Send email
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const { to, subject, html, from } = options

    const mailOptions = {
      from: from || `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Email sending failed:", error)
    return false
  }
}

// Email templates
export const emailTemplates = {
  welcomeEmail: (firstName: string, loginLink: string) => {
