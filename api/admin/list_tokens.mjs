import { scanIterator, mget } from '../_lib/kv.mjs';
import { keyFor } from '../_lib/common.mjs';

export default async function handler(req, res) {
  const adminKey = process.env.ADMIN_KEY;
  const provided = (req.query.admin_key || '').trim();
  if (!adminKey || provided !== adminKey) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    const roleFilter = (req.query.role || '').trim().toLowerCase();
    const keys = [];
    for await (const key of scanIterator('token:')) {
      keys.push(key);
    }
    const records = await mget(keys);
    const items = [];
    records.forEach((rec) => {
      if (!rec) return;
      if (roleFilter && rec.role !== roleFilter) return;
      items.push({ token: rec.token, role: rec.role, used: rec.used });
    });
    return res.status(200).json({ ok: true, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
