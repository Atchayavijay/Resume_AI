type Action = 'login' | 'signup' | 'refresh';

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

const limits: Record<Action, { max: number; windowMs: number }> = {
  login: { max: 5, windowMs: 15 * 60 * 1000 },    // 5 per 15 min
  signup: { max: 10, windowMs: 60 * 60 * 1000 },  // 10 per hour
  refresh: { max: 20, windowMs: 15 * 60 * 1000 }, // 20 per 15 min
};

function getKey(identifier: string, action: Action): string {
  return `${action}:${identifier}`;
}

export function checkRateLimit(
  identifier: string,
  action: Action
): { allowed: boolean; retryAfter?: number } {
  const config = limits[action];
  const key = getKey(identifier, action);
  const now = Date.now();

  let entry = store.get(key);

  if (!entry) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true };
  }

  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + config.windowMs };
    store.set(key, entry);
    return { allowed: true };
  }

  entry.count += 1;

  if (entry.count > config.max) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return { allowed: true };
}
