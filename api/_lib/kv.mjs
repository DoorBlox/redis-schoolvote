import { createClient } from 'redis';

// Initialize a lazy Redis client.  The connection is only established
// once on demand.  We support both `REDIS_URL` and `KV_REDIS_URL`
// environment variables.  `rediss://` URIs automatically enable TLS.
let client;
async function connect() {
  if (!client) {
    const url = process.env.REDIS_URL || process.env.KV_REDIS_URL;
    if (!url) {
      throw new Error(
        'REDIS_URL or KV_REDIS_URL environment variable must be set'
      );
    }
    client = createClient({
      url,
      // When using rediss://, tls will automatically be configured.  For
      // redis:// connections (no TLS), this option has no effect.
      socket: {
        tls: url.startsWith('rediss://'),
        rejectUnauthorized: false
      }
    });
    client.on('error', (err) => {
      console.error('Redis error', err);
    });
    await client.connect();
  }
  return client;
}

// Helper to get a JSON-parsed value from Redis.  Returns null if
// the key does not exist.
export async function get(key) {
  const c = await connect();
  const v = await c.get(key);
  return v ? JSON.parse(v) : null;
}

export async function set(key, value) {
  const c = await connect();
  await c.set(key, JSON.stringify(value));
}

export async function del(key) {
  const c = await connect();
  await c.del(key);
}

// Iterator for scanning keys with a prefix.  Returns an async
// iterable of key names.  Use `for await (const k of scanIterator()) {}`.
export function scanIterator(prefix) {
  const match = `${prefix}*`;
  return {
    async *[Symbol.asyncIterator]() {
      const c = await connect();
      for await (const key of c.scanIterator({ MATCH: match })) {
        yield key;
      }
    }
  };
}

// Fetch multiple keys at once.  Returns an array of parsed
// values matching the input order.
export async function mget(keys) {
  const c = await connect();
  const values = await c.mGet(keys);
  return values.map((v) => (v ? JSON.parse(v) : null));
}