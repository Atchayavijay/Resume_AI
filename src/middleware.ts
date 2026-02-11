import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const ACCESS_COOKIE = 'access_token';

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret || secret.length < 32) return false;
  const key = new TextEncoder().encode(secret);
  try {
    await jose.jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/builder', '/generate', '/templates'];
  const protectedApiPrefix = '/api/resumes';
  const isProtectedPage = protectedPaths.some((p) => pathname.startsWith(p));
  const isProtectedApi = pathname.startsWith(protectedApiPrefix);

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value ?? null;

  if (!token) {
    if (isProtectedPage) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const valid = await verifyToken(token);
  if (!valid) {
    if (isProtectedPage) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/builder/:path*', '/generate/:path*', '/templates/:path*', '/api/resumes/:path*'],
};
