import { NextRequest, NextResponse } from 'next/server';
import { getRefreshTokenFromCookies, setAuthCookies, clearAuthCookies } from '@/lib/auth/cookies';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { blacklistToken } from '@/lib/auth/blacklist';
import { isBlacklisted } from '@/lib/auth/blacklist';
import { checkRateLimit } from '@/lib/auth/rate-limit';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfter } = checkRateLimit(ip, 'refresh');
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many refresh attempts. Please try again later.',
          retryAfter,
        },
        { status: 429, headers: retryAfter ? { 'Retry-After': String(retryAfter) } : undefined }
      );
    }

    const refreshToken = getRefreshTokenFromCookies(request);
    if (!refreshToken) {
      const response = NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    const payload = await verifyRefreshToken(refreshToken);
    const blacklisted = await isBlacklisted(payload.jti);
    if (blacklisted) {
      const response = NextResponse.json(
        { error: 'Token revoked' },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    // Blacklist old refresh token (rotation)
    const expiresAt = new Date(payload.exp * 1000);
    await blacklistToken(payload.jti, expiresAt);

    const userId = payload.sub;
    const accessToken = await signAccessToken(userId);
    const { token: newRefreshToken } = await signRefreshToken(userId);

    const response = NextResponse.json({ success: true });
    setAuthCookies(response, accessToken, newRefreshToken);
    return response;
  } catch (error) {
    console.error('Refresh error:', error);
    const response = NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
    clearAuthCookies(response);
    return response;
  }
}
