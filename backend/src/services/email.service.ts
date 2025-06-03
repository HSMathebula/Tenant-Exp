import nodemailer from 'nodemailer';
import { AppError } from '../middleware/error.middleware';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@tenantexperience.com',
        to,
        subject,
        html
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new AppError(500, 'Failed to send email');
    }
  }

  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Welcome to Tenant Experience';
    const html = `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining Tenant Experience. We're excited to have you on board.</p>
      <p>You can now log in to your account and start managing your property experience.</p>
    `;
    await this.sendEmail(to, subject, html);
  }

  static async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const subject = 'Password Reset Request';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    await this.sendEmail(to, subject, html);
  }

  static async sendMaintenanceUpdateEmail(to: string, requestId: string, status: string): Promise<void> {
    const subject = 'Maintenance Request Update';
    const html = `
      <h1>Maintenance Request Update</h1>
      <p>Your maintenance request #${requestId} has been updated.</p>
      <p>New status: ${status}</p>
      <p>Log in to your account to view more details.</p>
    `;
    await this.sendEmail(to, subject, html);
  }

  static async sendPaymentConfirmationEmail(to: string, amount: number, date: Date): Promise<void> {
    const subject = 'Payment Confirmation';
    const html = `
      <h1>Payment Confirmation</h1>
      <p>Your payment of $${amount} has been received.</p>
      <p>Payment date: ${date.toLocaleDateString()}</p>
      <p>Thank you for your payment!</p>
    `;
    await this.sendEmail(to, subject, html);
  }
} 