// File: email.service.js

const nodemailer = require("nodemailer");

/**
 * Email Service
 *
 * Low-level send capability only. queues/email.queue.js is the
 * producer/consumer that decides *when* an email actually goes out;
 * this file just knows *how* to send one. Callers should almost
 * always go through emailQueue.enqueueEmail() rather than calling
 * sendEmail() directly, so sends are retried and don't block the
 * request/response cycle.
 */

let transporter = null;

const getTransporter = () => {
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
  async sendEmail(payload) {
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

  buildRFQInviteEmail(vendorName, rfqNumber, deadline) {
    return `
      <p>Dear ${vendorName},</p>
      <p>You have been invited to submit a quotation for RFQ <strong>${rfqNumber}</strong>.</p>
      <p>Submission deadline: <strong>${deadline.toDateString()}</strong>.</p>
      <p>Please log in to the vendor portal to submit your quotation.</p>
    `;
  }

  buildContractRenewalReminderEmail(contractTitle, endDate) {
    return `
      <p>This is a reminder that the contract <strong>${contractTitle}</strong> is due to expire on
      <strong>${endDate.toDateString()}</strong>.</p>
      <p>Please review and take action on renewal or termination.</p>
    `;
  }

  buildBudgetWarningEmail(departmentName, utilizationPercent) {
    return `
      <p>Budget for <strong>${departmentName}</strong> has reached
      <strong>${utilizationPercent.toFixed(1)}%</strong> utilization.</p>
      <p>Please review spending and reservations for this department.</p>
    `;
  }
}

const emailService = new EmailService();

module.exports = {
  EmailService,
  emailService,
};