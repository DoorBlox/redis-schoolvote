import { genId, keyFor } from '../_lib/common.mjs';
import { get, set } from '../_lib/kv.mjs';

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
    let { token, role } = req.body || {};
    role = role?.trim().toLowerCase();
    if (!role) return res.status(400).json({ ok: false, error: 'Missing role' });
    // Accept dynamic roles beyond male/female/teacher
    if (!token || typeof token !== 'string' || !token.trim()) {
      // generate random token
      token = genId(8);
    } else {
      token = token.trim();
    }
    // check collision
    const existing = await get(keyFor(token));
    if (existing) {
      return res.status(409).json({ ok: false, error: 'Token already exists' });
    }
    const rec = {
      token,
      role,
      used: false,
      used_at: '',
      vote_male: '',
      vote_female: ''
    };
    await set(keyFor(token), rec);
    return res.status(200).json({ ok: true, token, role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}