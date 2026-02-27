import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection, ensureAuthIndexes } from '@/lib/mongodb';
import { signupSchema } from '@/lib/validation/auth.schema';
import { hashPassword } from '@/lib/auth/password';
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
    const { allowed, retryAfter } = checkRateLimit(ip, 'signup');
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many signup attempts. Please try again later.',
          retryAfter,
        },
        { status: 429, headers: retryAfter ? { 'Retry-After': String(retryAfter) } : undefined }
      );
    }

    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((e) => e.message).join('; ');
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    await ensureAuthIndexes();
    const users = await getUsersCollection();

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const now = new Date();
    const result = await users.insertOne({
      email,
      name,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        message: 'Account created successfully. Please log in.',
        user: {
          id: result.insertedId.toString(),
          email,
          name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
