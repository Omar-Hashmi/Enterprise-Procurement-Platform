import nodemailer, { Transporter } from "nodemailer";

/**
 * Email Service
 * Low-level send capability only. queues/email.queue.ts is the
 * producer/consumer that decides *when* an email actually goes out;
 * this file just knows *how* to send one. Callers should almost
 * always go through emailQueue.enqueueEmail() rather than calling
 * sendEmail() directly, so sends are retried and don't block the
 * request/response cycle.
 */

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  return transporter;
};

class EmailService {
  async sendEmail(payload: EmailPayload): Promise<void> {
    const mailer = getTransporter();

    await mailer.sendMail({
      from: process.env.SMTP_FROM ?? "procurement@ezitech.example.com",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }

  // ---- Templates for Developer 2's domain events ----

  buildRFQInviteEmail(vendorName: string, rfqNumber: string, deadline: Date): EmailPayload["html"] {
    return `
      <p>Dear ${vendorName},</p>
      <p>You have been invited to submit a quotation for RFQ <strong>${rfqNumber}</strong>.</p>
      <p>Submission deadline: <strong>${deadline.toDateString()}</strong>.</p>
      <p>Please log in to the vendor portal to submit your quotation.</p>
    `;
  }

  buildContractRenewalReminderEmail(contractTitle: string, endDate: Date): string {
    return `
      <p>This is a reminder that the contract <strong>${contractTitle}</strong> is due to expire on
      <strong>${endDate.toDateString()}</strong>.</p>
      <p>Please review and take action on renewal or termination.</p>
    `;
  }

  buildBudgetWarningEmail(departmentName: string, utilizationPercent: number): string {
    return `
      <p>Budget for <strong>${departmentName}</strong> has reached
      <strong>${utilizationPercent.toFixed(1)}%</strong> utilization.</p>
      <p>Please review spending and reservations for this department.</p>
    `;
  }
}

export const emailService = new EmailService();
