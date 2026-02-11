import { NextRequest, NextResponse } from 'next/server';
import { getAccessTokenFromCookies } from './cookies';
import { verifyAccessToken } from './jwt';

/**
 * Get userId from request cookies. Returns null if not authenticated.
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = getAccessTokenFromCookies(request);
  if (!token) return null;
  try {
    const payload = await verifyAccessToken(token);
    return payload.sub;
  } catch {
    return null;
  }
}
