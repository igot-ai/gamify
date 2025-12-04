import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Root path redirects to login (client-side will handle auth check)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For protected routes, let client-side handle authentication
  // The API client will redirect to login on 401 errors
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
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
