import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This is a simple middleware for route protection
  // In a production app, you'd want more sophisticated authentication checking
  
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // For now, allow all routes (authentication is handled client-side)
  // In production, you might want to add more server-side checks
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

