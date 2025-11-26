import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'

/**
 * Test endpoint to verify email configuration
 * Usage: GET /api/test-email?to=your-email@example.com
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const testEmail = searchParams.get('to')

  if (!testEmail) {
    return NextResponse.json(
      { error: 'Missing "to" parameter. Usage: /api/test-email?to=your@email.com' },
      { status: 400 }
    )
  }

  try {
    console.log(`🧪 Testing email to: ${testEmail}`)
    
    const result = await sendVerificationEmail(
      testEmail,
      'test-token-123',
      'Test Gebruiker'
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `✅ Test email verzonden naar ${testEmail}!`,
        details: 'Check je inbox (en spam folder)',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: '❌ Email verzenden mislukt',
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      message: '❌ Onverwachte fout',
    }, { status: 500 })
  }
}

