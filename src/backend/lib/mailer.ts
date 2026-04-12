import nodemailer from 'nodemailer'
import { env } from './env'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
})

export async function sendResetPasswordEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`

  await transporter.sendMail({
    from: `"Collage Campus Admin" <${env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your Password - Collage Campus',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #555;">You requested a password reset. Click the button below to set a new password.</p>
        <p style="color: #555;">This link expires in <strong>15 minutes</strong>.</p>
        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            margin: 20px 0;
            padding: 12px 24px;
            background-color: #4F46E5;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          "
        >
          Reset Password
        </a>
        <p style="color: #999; font-size: 12px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
        <p style="color: #999; font-size: 12px;">
          Or copy and paste this link into your browser:<br />
          <a href="${resetUrl}" style="color: #4F46E5;">${resetUrl}</a>
        </p>
      </div>
    `,
  })
}
