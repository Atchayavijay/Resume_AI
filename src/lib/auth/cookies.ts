import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days for refresh
};

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  const domain = process.env.COOKIE_DOMAIN;
  const accessMaxAge = 60 * 15; // 15 min

  response.cookies.set(ACCESS_COOKIE, accessToken, {
    ...COOKIE_OPTS,
    maxAge: accessMaxAge,
    ...(domain && { domain }),
  });

  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    ...COOKIE_OPTS,
    ...(domain && { domain }),
  });
}

export function clearAuthCookies(response: NextResponse): void {
  const domain = process.env.COOKIE_DOMAIN;

  response.cookies.set(ACCESS_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    ...(domain && { domain }),
  });

  response.cookies.set(REFRESH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    ...(domain && { domain }),
  });
}

export function getAccessTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get(ACCESS_COOKIE)?.value ?? null;
}

export function getRefreshTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get(REFRESH_COOKIE)?.value ?? null;
}
