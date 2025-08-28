let redis = null;
try {
  if (process.env.REDIS_URL) {
    const Redis = require('ioredis');
    redis = new Redis(process.env.REDIS_URL);
  }
} catch (_) {
  // ioredis no instalado: se usa memoria
}

const mem = new Map();

async function cacheGet(key) {
  if (redis) {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  }
  return mem.get(key) ?? null;
}

async function cacheSet(key, value, ttlSeconds = 86400) {
  const raw = JSON.stringify(value);
  if (redis) {
    await redis.set(key, raw, 'EX', ttlSeconds);
  } else {
    mem.set(key, value);
    setTimeout(() => mem.delete(key), ttlSeconds * 1000).unref?.();
  }
}

module.exports = { cacheGet, cacheSet };
