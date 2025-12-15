import { Resend } from "resend"
import nodemailer from "nodemailer"

// SMTP Configuration
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587")
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_SECURE = process.env.SMTP_SECURE === "true"

// Resend Configuration (Fallback or Primary depending on env)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Common Configuration
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "support@proefrit-autoofy.nl"
const FROM_NAME = process.env.FROM_NAME || process.env.RESEND_FROM_NAME || "Autoofy"
const BASE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://proefrit-autoofy.nl"

// Configure Nodemailer transport
const transporter = SMTP_HOST ? nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
}) : null

if (!resend && !transporter) {
  console.warn("⚠️ Geen e-mail service geconfigureerd (geen SMTP en geen Resend). E-mail functionaliteit zal niet werken.")
} else {
  if (transporter) {
    console.log(`✅ SMTP service geconfigureerd (${SMTP_HOST}:${SMTP_PORT})`)
  }
  if (resend) {
    console.log("✅ Resend service geconfigureerd")
  }
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

/**
 * Send email using available provider (SMTP prefers over Resend)
 */
async function sendEmail({ to, subject, html, text, replyTo }: EmailOptions) {
  // Try SMTP first if configured
  if (transporter) {
    try {
      console.log(`Sending email via SMTP to: ${to}${replyTo ? ` (Reply-To: ${replyTo})` : ''}`)
      const info = await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
        replyTo: replyTo || undefined,
      })
      console.log("SMTP Email sent:", info.messageId)
      return { success: true, data: info }
    } catch (error: any) {
      console.error("SMTP Send Error:", error)
      // If SMTP fails and we have Resend, try Resend as backup?
      // For now, just return error or fall through if we want fallback logic
      if (!resend) {
        return { success: false, error: error.message || "SMTP Error" }
      }
      console.log("Falling back to Resend...")
    }
  }

  // Try Resend if SMTP not configured or failed
  if (resend) {
    try {
      console.log(`Sending email via Resend to: ${to}${replyTo ? ` (Reply-To: ${replyTo})` : ''}`)
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
        text,
        reply_to: replyTo || undefined,
      })

      if (error) {
        console.error("Resend API error:", error)
        return { success: false, error: error.message || "Unknown error" }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error("Resend Error:", error)
      return { success: false, error: error.message || "Resend Error" }
    }
  }

  return { success: false, error: "No email service configured" }
}

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
  const verificationUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`

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

  return sendEmail({
    to: email,
    subject: "Verifieer uw e-mailadres - Autoofy",
    html,
    text: `Welkom bij Autoofy, ${name}!\n\nBedankt voor uw registratie. Om uw account te activeren, klik op de volgende link:\n\n${verificationUrl}\n\nDeze link verloopt over 24 uur.\n\nAls u deze e-mail niet heeft aangevraagd, kunt u deze negeren.`
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string, name: string) {
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

  return sendEmail({
    to: email,
    subject: "Wachtwoord resetten - Autoofy",
    html,
    text: `Hallo ${name},\n\nU heeft verzocht om uw wachtwoord te resetten. Klik op de volgende link:\n\n${resetUrl}\n\nDeze link verloopt over 1 uur.\n\nAls u deze e-mail niet heeft aangevraagd, kunt u deze negeren.`
  })
}

/**
 * Resend verification email (for users who didn't receive it)
 */
export async function resendVerificationEmail(email: string, token: string, name: string) {
  const verificationUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`

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

  return sendEmail({
    to: email,
    subject: "Verificatie e-mail opnieuw verzonden - Autoofy",
    html,
    text: `Hallo ${name},\n\nU heeft verzocht om de verificatie e-mail opnieuw te ontvangen. Klik op de volgende link:\n\n${verificationUrl}\n\nDeze link verloopt over 24 uur.`
  })
}

/**
 * Send feedback request email after test drive completion
 */
export async function sendFeedbackEmail(
  customerEmail: string, 
  customerName: string,
  companyName: string,
  carType: string,
  feedbackUrl: string
) {
  const content = `
    <div style="color: #1f2937;">
      <h2 style="color: #1D3557; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
        Bedankt voor uw proefrit, ${customerName}!
      </h2>
      <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
        We hopen dat u een aangename proefrit heeft gehad met de <strong>${carType}</strong>. 
        Uw mening is belangrijk voor ons en helpt ons om onze service te verbeteren.
      </p>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #1D3557; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
          ⭐ Deel uw ervaring
        </h3>
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
          We zouden het zeer op prijs stellen als u een paar minuten de tijd neemt om onze korte vragenlijst in te vullen. 
          Het kost slechts 1-2 minuten!
        </p>
        
        <div style="text-align: center;">
          <a href="${feedbackUrl}" 
             style="display: inline-block; background-color: #B22234; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(178, 34, 52, 0.3);">
            ⭐ Geef uw feedback
          </a>
        </div>
      </div>

      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #166534; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>✓ Snel en eenvoudig:</strong> Beoordeel uw ervaring met sterren en deel optioneel uw opmerkingen. 
          U kunt de vragenlijst ook op uw telefoon invullen!
        </p>
      </div>

      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>💡 Uw mening telt!</strong><br>
          Met uw waardevolle feedback kunnen we onze service blijven verbeteren.
        </p>
      </div>

      <div style="background-color: #f9fafb; border-left: 4px solid #6b7280; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
          Als de knop niet werkt, kopieer en plak deze link in uw browser:
        </p>
        <p style="color: #B22234; font-size: 12px; margin: 0; word-break: break-all; font-family: monospace;">
          ${feedbackUrl}
        </p>
      </div>

      <p style="color: #4b5563; margin: 20px 0 0 0; font-size: 15px; line-height: 1.6;">
        Met vriendelijke groet,<br>
        <strong style="color: #1D3557;">${companyName}</strong>
      </p>
    </div>
  `

  const html = getEmailTemplate(content, "Uw mening is belangrijk!")
  const plainText = `Bedankt voor uw proefrit, ${customerName}!

We hopen dat u een aangename proefrit heeft gehad met de ${carType}. Uw mening is belangrijk voor ons en helpt ons om onze service te verbeteren.

⭐ Deel uw ervaring

We zouden het zeer op prijs stellen als u een paar minuten de tijd neemt om onze korte vragenlijst in te vullen. Het kost slechts 1-2 minuten!

Klik op deze link om uw feedback te geven:
${feedbackUrl}

Met uw waardevolle feedback kunnen we onze service blijven verbeteren.

Met vriendelijke groet,
${companyName}`

  return sendEmail({
    to: customerEmail,
    subject: `Uw mening over de proefrit - ${companyName}`,
    html,
    text: plainText,
  })
}

/**
 * Send notification to admin when a new user registers
 */
export async function sendNewUserNotificationEmail(
  adminEmail: string,
  userName: string,
  userEmail: string,
  companyName: string
) {
  const adminUrl = `${BASE_URL}/admin/users`
  
  const content = `
    <div style="color: #1f2937;">
      <h2 style="color: #1D3557; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
        🆕 Nieuwe gebruiker geregistreerd
      </h2>
      <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
        Er heeft zich een nieuwe gebruiker geregistreerd die wacht op goedkeuring.
      </p>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #1D3557; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
          📋 Gebruikersgegevens
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Naam:</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">E-mail:</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Bedrijf:</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${companyName}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${adminUrl}" 
           style="display: inline-block; background-color: #B22234; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(178, 34, 52, 0.3);">
          👤 Bekijk en keur goed
        </a>
      </div>

      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>⚠️ Actie vereist:</strong> Deze gebruiker kan pas inloggen nadat u het account heeft goedgekeurd.
        </p>
      </div>
    </div>
  `

  const html = getEmailTemplate(content, "Nieuwe gebruiker wacht op goedkeuring")
  const plainText = `Nieuwe gebruiker geregistreerd

Er heeft zich een nieuwe gebruiker geregistreerd die wacht op goedkeuring.

Gebruikersgegevens:
- Naam: ${userName}
- E-mail: ${userEmail}
- Bedrijf: ${companyName}

Ga naar het admin dashboard om het account goed te keuren:
${adminUrl}

Deze gebruiker kan pas inloggen nadat u het account heeft goedgekeurd.`

  return sendEmail({
    to: adminEmail,
    subject: `🆕 Nieuwe gebruiker: ${userName} (${companyName}) - Goedkeuring vereist`,
    html,
    text: plainText,
  })
}

/**
 * Send approval email to user when their account is approved
 */
export async function sendApprovalEmail(
  userEmail: string,
  userName: string
) {
  const loginUrl = BASE_URL
  
  const content = `
    <div style="color: #1f2937;">
      <h2 style="color: #1D3557; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
        🎉 Uw account is goedgekeurd!
      </h2>
      <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
        Goed nieuws, ${userName}! Uw account bij Autoofy is goedgekeurd en u kunt nu inloggen.
      </p>
      
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h3 style="color: #166534; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">
          Account geactiveerd
        </h3>
        <p style="color: #15803d; margin: 0; font-size: 14px;">
          U heeft nu volledige toegang tot alle functies
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${loginUrl}" 
           style="display: inline-block; background-color: #B22234; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(178, 34, 52, 0.3);">
          🚀 Nu inloggen
        </a>
      </div>

      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #1e40af; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>💡 Tip:</strong> Start met het invullen van uw bedrijfsgegevens zodat deze op alle proefrit formulieren verschijnen.
        </p>
      </div>

      <p style="color: #4b5563; margin: 20px 0 0 0; font-size: 15px; line-height: 1.6;">
        Met vriendelijke groet,<br>
        <strong style="color: #1D3557;">Het Autoofy Team</strong>
      </p>
    </div>
  `

  const html = getEmailTemplate(content, "Account goedgekeurd!")
  const plainText = `Uw account is goedgekeurd!

Goed nieuws, ${userName}! Uw account bij Autoofy is goedgekeurd en u kunt nu inloggen.

✅ Account geactiveerd
U heeft nu volledige toegang tot alle functies.

Log nu in op: ${loginUrl}

Tip: Start met het invullen van uw bedrijfsgegevens zodat deze op alle proefrit formulieren verschijnen.

Met vriendelijke groet,
Het Autoofy Team`

  return sendEmail({
    to: userEmail,
    subject: `🎉 Uw Autoofy account is goedgekeurd!`,
    html,
    text: plainText,
  })
}