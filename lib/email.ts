import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️ RESEND_API_KEY is not set. Email functionality will not work.")
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
const BASE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export async function sendVerificationEmail(email: string, token: string, name: string) {
  if (!resend) {
    console.error("Resend is not configured. Cannot send verification email.")
    return { success: false, error: "Email service not configured" }
  }

  const verificationUrl = `${BASE_URL}/auth/verify-email?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: `Autoofy <${FROM_EMAIL}>`,
      to: email,
      subject: "Verifieer uw e-mailadres - Autoofy",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verifieer uw e-mailadres</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1D3557; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">Autoofy</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1D3557; margin-top: 0;">Welkom bij Autoofy, ${name}!</h2>
              <p>Bedankt voor uw registratie. Om uw account te activeren, moet u eerst uw e-mailadres verifiëren.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background-color: #B22234; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background-color 0.3s;">Verifieer e-mailadres</a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Als de knop niet werkt, kopieer en plak deze link in uw browser:
                <br>
                <a href="${verificationUrl}" style="color: #B22234; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                Deze link verloopt over 24 uur. Als u deze e-mail niet heeft aangevraagd, kunt u deze negeren.
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Autoofy. Alle rechten voorbehouden.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("Error sending verification email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending verification email:", error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  if (!resend) {
    console.error("Resend is not configured. Cannot send password reset email.")
    return { success: false, error: "Email service not configured" }
  }

  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: `Autoofy <${FROM_EMAIL}>`,
      to: email,
      subject: "Wachtwoord resetten - Autoofy",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Wachtwoord resetten</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1D3557; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">Autoofy</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1D3557; margin-top: 0;">Wachtwoord resetten</h2>
              <p>Hallo ${name},</p>
              <p>U heeft verzocht om uw wachtwoord te resetten. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #B22234; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background-color 0.3s;">Reset wachtwoord</a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Als de knop niet werkt, kopieer en plak deze link in uw browser:
                <br>
                <a href="${resetUrl}" style="color: #B22234; word-break: break-all;">${resetUrl}</a>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                <strong>Deze link verloopt over 1 uur.</strong>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                Als u deze e-mail niet heeft aangevraagd, kunt u deze veilig negeren. Uw wachtwoord blijft ongewijzigd.
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Autoofy. Alle rechten voorbehouden.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("Error sending password reset email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error }
  }
}

