import nodemailer from 'nodemailer'

const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null

// Sends an email when SMTP is configured; otherwise logs it (so the demo still works).
export async function sendMail({ to, subject, text }) {
  if (!transporter) {
    console.log(`[mail:stub] to=${to} · ${subject} — ${text}`)
    return { stubbed: true }
  }
  await transporter.sendMail({ from: process.env.MAIL_FROM || 'TransitOps <no-reply@transitops.app>', to, subject, text })
  return { sent: true }
}
