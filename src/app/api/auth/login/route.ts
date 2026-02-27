import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import { loginSchema } from '@/lib/validation/auth.schema';
import { verifyPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
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
    const { allowed, retryAfter } = checkRateLimit(ip, 'login');
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter,
        },
        { status: 429, headers: retryAfter ? { 'Retry-After': String(retryAfter) } : undefined }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((e) => e.message).join('; ');
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const users = await getUsersCollection();

    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userId = user._id.toString();
    const accessToken = await signAccessToken(userId);
    const { token: refreshToken } = await signRefreshToken(userId);

    const response = NextResponse.json({
      user: {
        id: userId,
        email: user.email,
        name: user.name,
      },
    });

    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}
