import { getTokenBlacklistCollection } from '@/lib/mongodb';

export async function blacklistToken(tokenId: string, expiresAt: Date): Promise<void> {
  const collection = await getTokenBlacklistCollection();
  await collection.insertOne({
    tokenId,
    expiresAt,
    createdAt: new Date(),
  });
}

export async function isBlacklisted(tokenId: string): Promise<boolean> {
  const collection = await getTokenBlacklistCollection();
  const doc = await collection.findOne({ tokenId });
  return !!doc;
}
