import { del } from '../_lib/kv.mjs';
import { keyFor } from '../_lib/common.mjs';

export default async function handler(req, res) {
  const adminKey = process.env.ADMIN_KEY;
  const provided = (req.query.admin_key || '').trim();
  if (!adminKey || provided !== adminKey) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });
    await del(keyFor(token));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}