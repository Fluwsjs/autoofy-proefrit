import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️ RESEND_API_KEY is not set. Email functionality will not work.")
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
const FROM_NAME = process.env.RESEND_FROM_NAME || "Autoofy"
const BASE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

/**
 * Get a professional email template wrapper
 */
function getEmailTemplate(content: string, title: string) {
  return `
    <!DOCTYPE html>
    <html lang="nl">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1D3557 0%, #457B9D 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Autoofy</h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">Proefritbeheer Systeem</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    ${content}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
                      © ${new Date().getFullYear()} Autoofy. Alle rechten voorbehouden.
                    </p>
                    <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                      Deze e-mail is automatisch gegenereerd. Gelieve niet te antwoorden.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email: string, token: string, name: string) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.error("Resend is not configured. Cannot send verification email.")
    return { success: false, error: "Email service not configured" }
  }

  const verificationUrl = `${BASE_URL}/auth/verify-email?token=${token}`

  const content = `
    <div style="color: #1f2937;">
      <h2 style="color: #1D3557; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
        Welkom bij Autoofy, ${name}!
      </h2>
      <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
        Bedankt voor uw registratie. Om uw account te activeren en te beginnen met het beheren van proefritten, moet u eerst uw e-mailadres verifiëren.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationUrl}" 
           style="display: inline-block; background-color: #B22234; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s; box-shadow: 0 2px 4px rgba(178, 34, 52, 0.2);">
          Verifieer e-mailadres
        </a>
      </div>
      <div style="background-color: #f9fafb; border-left: 4px solid #B22234; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">
          📧 E-mail niet ontvangen?
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">
          Als de knop niet werkt, kopieer en plak deze link in uw browser:
        </p>
        <p style="color: #B22234; font-size: 13px; margin: 0; word-break: break-all; font-family: monospace;">
          ${verificationUrl}
        </p>
      </div>
      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #1e40af; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>⏰ Belangrijk:</strong> Deze verificatielink verloopt over <strong>24 uur</strong>. 
          Als u deze e-mail niet heeft aangevraagd, kunt u deze veilig negeren.
        </p>
      </div>
    </div>
  `

  const html = getEmailTemplate(content, "Verifieer uw e-mailadres")

  try {
    console.log(`Attempting to send verification email to: ${email}`)
    console.log(`From: ${FROM_NAME} <${FROM_EMAIL}>`)
    console.log(`Base URL: ${BASE_URL}`)

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [email],
      subject: "Verifieer uw e-mailadres - Autoofy",
      html,
      text: `Welkom bij Autoofy, ${name}!\n\nBedankt voor uw registratie. Om uw account te activeren, klik op de volgende link:\n\n${verificationUrl}\n\nDeze link verloopt over 24 uur.\n\nAls u deze e-mail niet heeft aangevraagd, kunt u deze negeren.`,
    })

    if (error) {
      console.error("Resend API error:", error)
      return { success: false, error: error.message || "Unknown error" }
    }

    console.log("Email sent successfully. Resend response:", data)

    return { success: true, data }
  } catch (error: any) {
    console.error("Error sending verification email:", error)
    return { 
      success: false, 
      error: error.message || "Unknown error" 
    }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.error("Resend is not configured. Cannot send password reset email.")
    return { success: false, error: "Email service not configured" }
  }

  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`

  const content = `
    <div style="color: #1f2937;">
      <h2 style="color: #1D3557; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
        Wachtwoord resetten
      </h2>
      <p style="color: #4b5563; margin: 0 0 12px 0; font-size: 16px; line-height: 1.6;">
        Hallo ${name},
      </p>
      <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
        U heeft verzocht om uw wachtwoord te resetten. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" 
           style="display: inline-block; background-color: #B22234; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s; box-shadow: 0 2px 4px rgba(178, 34, 52, 0.2);">
          Reset wachtwoord
        </a>
      </div>
      <div style="background-color: #f9fafb; border-left: 4px solid #B22234; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">
          🔗 Link niet werkend?
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">
          Als de knop niet werkt, kopieer en plak deze link in uw browser:
        </p>
        <p style="color: #B22234; font-size: 13px; margin: 0; word-break: break-all; font-family: monospace;">
          ${resetUrl}
        </p>
      </div>
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>⏰ Belangrijk:</strong> Deze link verloopt over <strong>1 uur</strong> om uw account te beschermen.
        </p>
      </div>
      <div style="background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>🔒 Beveiliging:</strong> Als u deze e-mail niet heeft aangevraagd, kunt u deze veilig negeren. Uw wachtwoord blijft ongewijzigd.
        </p>
      </div>
    </div>
  `

  const html = getEmailTemplate(content, "Wachtwoord resetten")

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [email],
      subject: "Wachtwoord resetten - Autoofy",
      html,
      text: `Hallo ${name},\n\nU heeft verzocht om uw wachtwoord te resetten. Klik op de volgende link:\n\n${resetUrl}\n\nDeze link verloopt over 1 uur.\n\nAls u deze e-mail niet heeft aangevraagd, kunt u deze negeren.`,
    })

    if (error) {
      console.error("Resend API error:", error)
      return { success: false, error: error.message || "Unknown error" }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error sending password reset email:", error)
    return { 
      success: false, 
      error: error.message || "Unknown error" 
    }
  }
}

/**
 * Resend verification email (for users who didn't receive it)
 */
export async function resendVerificationEmail(email: string, token: string, name: string) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.error("Resend is not configured. Cannot resend verification email.")
    return { success: false, error: "Email service not configured" }
  }

  const verificationUrl = `${BASE_URL}/auth/verify-email?token=${token}`

  const content = `
    <div style="color: #1f2937;">
      <h2 style="color: #1D3557; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
        Verificatie e-mail opnieuw verzonden
      </h2>
      <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
        Hallo ${name},
      </p>
      <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
        U heeft verzocht om de verificatie e-mail opnieuw te ontvangen. Klik op de onderstaande knop om uw e-mailadres te verifiëren.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationUrl}" 
           style="display: inline-block; background-color: #B22234; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s; box-shadow: 0 2px 4px rgba(178, 34, 52, 0.2);">
          Verifieer e-mailadres
        </a>
      </div>
      <div style="background-color: #f9fafb; border-left: 4px solid #B22234; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">
          📧 E-mail niet ontvangen?
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">
          Als de knop niet werkt, kopieer en plak deze link in uw browser:
        </p>
        <p style="color: #B22234; font-size: 13px; margin: 0; word-break: break-all; font-family: monospace;">
          ${verificationUrl}
        </p>
      </div>
      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #1e40af; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>⏰ Belangrijk:</strong> Deze verificatielink verloopt over <strong>24 uur</strong>.
        </p>
      </div>
    </div>
  `

  const html = getEmailTemplate(content, "Verificatie e-mail opnieuw verzonden")

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [email],
      subject: "Verificatie e-mail opnieuw verzonden - Autoofy",
      html,
      text: `Hallo ${name},\n\nU heeft verzocht om de verificatie e-mail opnieuw te ontvangen. Klik op de volgende link:\n\n${verificationUrl}\n\nDeze link verloopt over 24 uur.`,
    })

    if (error) {
      console.error("Resend API error:", error)
      return { success: false, error: error.message || "Unknown error" }
    }

    console.log("Resend verification email sent successfully")

    return { success: true, data }
  } catch (error: any) {
    console.error("Error resending verification email:", error)
    return { 
      success: false, 
      error: error.message || "Unknown error" 
    }
  }
}
