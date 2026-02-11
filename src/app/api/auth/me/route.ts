import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getAccessTokenFromCookies } from '@/lib/auth/cookies';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getUsersCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = getAccessTokenFromCookies(request);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    const users = await getUsersCollection();
    const user = await users.findOne(
      { _id: new ObjectId(payload.sub) },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
