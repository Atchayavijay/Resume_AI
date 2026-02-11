import * as jose from 'jose';
import { randomUUID } from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

function getAccessKey() {
  if (!ACCESS_SECRET || ACCESS_SECRET.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be set and at least 32 characters');
  }
  return new TextEncoder().encode(ACCESS_SECRET);
}

function getRefreshKey() {
  if (!REFRESH_SECRET || REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be set and at least 32 characters');
  }
  return new TextEncoder().encode(REFRESH_SECRET);
}

export interface JWTPayload {
  sub: string;
  jti: string;
}

export async function signAccessToken(userId: string): Promise<string> {
  const key = await getAccessKey();
  const jti = randomUUID();
  return new jose.SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setJti(jti)
    .setExpirationTime(ACCESS_EXPIRY)
    .setIssuedAt()
    .sign(key);
}

export async function signRefreshToken(userId: string): Promise<{ token: string; jti: string }> {
  const key = await getRefreshKey();
  const jti = randomUUID();
  const token = await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setJti(jti)
    .setExpirationTime(REFRESH_EXPIRY)
    .setIssuedAt()
    .sign(key);
  return { token, jti };
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const key = await getAccessKey();
  const { payload } = await jose.jwtVerify(token, key);
  return {
    sub: payload.sub as string,
    jti: payload.jti as string,
  };
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload & { exp: number }> {
  const key = await getRefreshKey();
  const { payload } = await jose.jwtVerify(token, key);
  return {
    sub: payload.sub as string,
    jti: payload.jti as string,
    exp: payload.exp as number,
  };
}
