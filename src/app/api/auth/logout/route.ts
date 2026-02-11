import { NextRequest, NextResponse } from 'next/server';
import { getRefreshTokenFromCookies } from '@/lib/auth/cookies';
import { clearAuthCookies } from '@/lib/auth/cookies';
import { verifyRefreshToken } from '@/lib/auth/jwt';
import { blacklistToken } from '@/lib/auth/blacklist';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshTokenFromCookies(request);

    if (refreshToken) {
      try {
        const payload = await verifyRefreshToken(refreshToken);
        const expiresAt = new Date(payload.exp * 1000);
        await blacklistToken(payload.jti, expiresAt);
      } catch {
        // Token invalid or expired; still clear cookies
      }
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json(
      { error: 'Failed to log out' },
      { status: 500 }
    );
    clearAuthCookies(response);
    return response;
  }
}
