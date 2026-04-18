const RATE_LIMIT_KEY = 'auth_attempts';
const BLOCK_COUNT_KEY = 'auth_blocks';
const MAX_ATTEMPTS = 3;
const BASE_WINDOW_MS = 120 * 1000; // 2 minutes

interface AttemptRecord {
  timestamp: number;
}

export const checkRateLimit = (): {allowed: boolean;remainingMs: number;} => {
  try {
    const now = Date.now();
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const blocksStored = localStorage.getItem(BLOCK_COUNT_KEY);

    let attempts: AttemptRecord[] = stored ? JSON.parse(stored) : [];
    let blocks: number = blocksStored ? parseInt(blocksStored, 10) : 0;

    const currentWindowMs = BASE_WINDOW_MS * Math.pow(2, blocks);

    // Filter out old attempts
    attempts = attempts.filter((a) => now - a.timestamp < currentWindowMs);

    if (attempts.length >= MAX_ATTEMPTS) {
      const oldestAttempt = attempts[0];
      const remainingMs = currentWindowMs - (now - oldestAttempt.timestamp);

      // If this is the exact moment we hit the limit, increment block count
      if (
      attempts.length === MAX_ATTEMPTS &&
      now - attempts[attempts.length - 1].timestamp < 1000)
      {
        blocks += 1;
        localStorage.setItem(BLOCK_COUNT_KEY, blocks.toString());
      }

      return { allowed: false, remainingMs };
    }

    // Add new attempt
    attempts.push({ timestamp: now });
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(attempts));

    return { allowed: true, remainingMs: 0 };
  } catch (e) {
    // Fallback if localStorage fails
    return { allowed: true, remainingMs: 0 };
  }
};

export const clearRateLimit = () => {
  localStorage.removeItem(RATE_LIMIT_KEY);
  localStorage.removeItem(BLOCK_COUNT_KEY);
};