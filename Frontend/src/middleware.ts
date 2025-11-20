import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ['/auth'];
  
  const adminPaths = ['/admin'];

  if (publicPaths.some(path => pathname.startsWith(path))) {
    if (token) {
      if (role === 'admin' || role === 'dev') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (adminPaths.some(path => pathname.startsWith(path))) {
    if (role !== 'admin' && role !== 'dev') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};