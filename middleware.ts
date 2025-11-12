import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Optional: Multi-tenant routing based on subdomain
  const hostname = request.headers.get("host") || ""
  const tenant = hostname.split(".")[0]

  // Only set tenant header if it's not localhost
  if (tenant && !hostname.includes("localhost")) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-tenant", tenant)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
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

