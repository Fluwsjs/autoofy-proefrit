import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Pattern to detect potential XSS in URL parameters
const XSS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+=/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /<svg.*onload/i,
  /data:text\/html/i,
]

function containsXSS(value: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(value))
}

function hasXSSInParams(url: URL): boolean {
  // Check all query parameter names and values
  for (const [key, value] of url.searchParams.entries()) {
    if (containsXSS(key) || containsXSS(value)) {
      return true
    }
  }
  // Also check the full search string for encoded payloads
  if (url.search && containsXSS(decodeURIComponent(url.search))) {
    return true
  }
  return false
}

export function middleware(request: NextRequest) {
  const url = new URL(request.url)
  
  // Security: Block requests with XSS payloads in URL parameters
  try {
    if (hasXSSInParams(url)) {
      console.warn(`🛡️ [SECURITY] Blocked potential XSS attack from ${request.ip || 'unknown'}: ${url.pathname}${url.search}`)
      return new NextResponse("Bad Request", { status: 400 })
    }
  } catch (e) {
    // If URL parsing fails, it might be a malformed attack
    console.warn(`🛡️ [SECURITY] Blocked malformed request: ${e}`)
    return new NextResponse("Bad Request", { status: 400 })
  }

  // Optional: Multi-tenant routing based on subdomain
  const hostname = request.headers.get("host") || ""
  const tenant = hostname.split(".")[0]

  // Create response with security headers
  const requestHeaders = new Headers(request.headers)
  
  // Only set tenant header if it's not localhost
  if (tenant && !hostname.includes("localhost")) {
    requestHeaders.set("x-tenant", tenant)
  }
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  
  // Content Security Policy - protects against XSS
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

