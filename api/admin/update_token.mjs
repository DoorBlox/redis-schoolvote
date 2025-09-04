import { get, set } from '../_lib/kv.mjs';
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
    const { token, role, reset } = req.body || {};
    if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });
    const rec = await get(keyFor(token));
    if (!rec) return res.status(404).json({ ok: false, error: 'Token not found' });
    if (role) {
      rec.role = role.trim().toLowerCase();
    }
    if (reset) {
      rec.used = false;
      rec.used_at = '';
      rec.vote_male = '';
      rec.vote_female = '';
    }
    await set(keyFor(token), rec);
    return res.status(200).json({ ok: true, rec });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}