import nodemailer from 'nodemailer'
import { prisma } from './prisma.js'

const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null

// Sends an email when SMTP is configured (otherwise logs it), and records it to the Sent Mails outbox.
export async function sendMail({ to, subject, text, type = 'general', isDemo = false }) {
  let status = 'sent'
  try {
    if (transporter) {
      await transporter.sendMail({ from: process.env.MAIL_FROM || 'TransitOps <no-reply@transitops.app>', to, subject, text })
    } else {
      status = 'logged'
      console.log(`[mail:stub] to=${to} · ${subject}`)
    }
  } catch (err) {
    status = 'failed'
    console.error('[mail] send failed:', err.message)
  }
  await prisma.mailLog.create({ data: { to, subject, body: text, type, status, isDemo } })
  return { status }
}
