import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware for route protection
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Root path redirects to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Auth is handled on the client side with the AuthContext
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
