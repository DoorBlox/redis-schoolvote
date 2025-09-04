import { genId, keyFor } from '../_lib/common.mjs';
import { set, get } from '../_lib/kv.mjs';

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
    const { role, count } = req.body || {};
    const allowedRoles = ['male', 'female', 'teacher'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ ok: false, error: 'Invalid role' });
    }
    const n = Math.min(1000, Math.max(1, Number(count) || 0));
    const tokens = [];
    for (let i = 0; i < n; i++) {
      let token;
      // ensure unique token
      while (true) {
        token = genId(8);
        const exists = await get(keyFor(token));
        if (!exists) break;
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
      tokens.push(rec);
    }
    return res.status(200).json({ ok: true, generated: n, role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}