import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { AppError } from '../middleware/error.middleware';

type EmailContext = {
  firstName: string;
  loginUrl?: string;
  resetUrl?: string;
  maintenanceId?: string;
  status?: string;
  updateMessage?: string;
  detailsUrl?: string;
  amount?: number;
  date?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  leaseEndDate?: string;
  renewalUrl?: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  eventDescription?: string;
  rsvpUrl?: string;
  documentName?: string;
  documentType?: string;
  uploadDate?: string;
  documentUrl?: string;
};

type MaintenanceUpdate = {
  id: string;
  status: string;
  updateMessage: string;
};

type PaymentConfirmation = {
  id: string;
  amount: number;
  date: string;
  method: string;
};

type LeaseRenewal = {
  id: string;
  endDate: string;
};

type EventInvitation = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
};

type DocumentUpload = {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
};

export class EmailService {
  private transporter: nodemailer.Transporter;
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.loadTemplates();
  }

  private loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/email');
    const templateFiles = fs.readdirSync(templatesDir);

    templateFiles.forEach(file => {
      if (file.endsWith('.hbs')) {
        const templateName = path.basename(file, '.hbs');
        const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
        this.templates.set(templateName, handlebars.compile(templateContent));
      }
    });
  }

  async sendEmail(options: {
    to: string | string[];
    subject: string;
    template: string;
    context: EmailContext;
    attachments?: {
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }[];
  }): Promise<void> {
    const template = this.templates.get(options.template);
    if (!template) {
      throw new AppError(500, `Email template '${options.template}' not found`);
    }

    const html = template(options.context);

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.SMTP_FROM,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      html,
      attachments: options.attachments
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new AppError(500, 'Failed to send email');
    }
  }

  // Predefined email templates
  async sendWelcomeEmail(user: { email: string; firstName: string }) {
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Our Platform',
      template: 'welcome',
      context: {
        firstName: user.firstName,
        loginUrl: `${process.env.FRONTEND_URL}/login`
      }
    });
  }

  async sendPasswordResetEmail(user: { email: string; firstName: string }, resetToken: string) {
    await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        firstName: user.firstName,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });
  }

  async sendMaintenanceUpdateEmail(user: { email: string; firstName: string }, maintenance: MaintenanceUpdate) {
    await this.sendEmail({
      to: user.email,
      subject: 'Maintenance Request Update',
      template: 'maintenance-update',
      context: {
        firstName: user.firstName,
        maintenanceId: maintenance.id,
        status: maintenance.status,
        updateMessage: maintenance.updateMessage,
        detailsUrl: `${process.env.FRONTEND_URL}/maintenance/${maintenance.id}`
      }
    });
  }

  async sendPaymentConfirmationEmail(user: { email: string; firstName: string }, payment: PaymentConfirmation) {
    await this.sendEmail({
      to: user.email,
      subject: 'Payment Confirmation',
      template: 'payment-confirmation',
      context: {
        firstName: user.firstName,
        amount: payment.amount,
        date: payment.date,
        paymentMethod: payment.method,
        receiptUrl: `${process.env.FRONTEND_URL}/payments/${payment.id}/receipt`
      }
    });
  }

  async sendLeaseRenewalReminderEmail(user: { email: string; firstName: string }, lease: LeaseRenewal) {
    await this.sendEmail({
      to: user.email,
      subject: 'Lease Renewal Reminder',
      template: 'lease-renewal',
      context: {
        firstName: user.firstName,
        leaseEndDate: lease.endDate,
        renewalUrl: `${process.env.FRONTEND_URL}/leases/${lease.id}/renew`
      }
    });
  }

  async sendEventInvitationEmail(user: { email: string; firstName: string }, event: EventInvitation) {
    await this.sendEmail({
      to: user.email,
      subject: `Event Invitation: ${event.title}`,
      template: 'event-invitation',
      context: {
        firstName: user.firstName,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        eventDescription: event.description,
        rsvpUrl: `${process.env.FRONTEND_URL}/events/${event.id}/rsvp`
      }
    });
  }

  async sendDocumentUploadNotificationEmail(user: { email: string; firstName: string }, document: DocumentUpload) {
    await this.sendEmail({
      to: user.email,
      subject: 'New Document Uploaded',
      template: 'document-upload',
      context: {
        firstName: user.firstName,
        documentName: document.name,
        documentType: document.type,
        uploadDate: document.uploadDate,
        documentUrl: `${process.env.FRONTEND_URL}/documents/${document.id}`
      }
    });
  }
} 