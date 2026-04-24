import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode('your_secret_key_here')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('authToken')?.value

  // Allow login page without token
  if (pathname === '/login') {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET)
        return NextResponse.redirect(new URL('/clients', request.url))
      } catch {
        return NextResponse.next()
      }
    }
    return NextResponse.next()
  }

  // Protect ALL other routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}