import { get } from './_lib/kv.mjs';
import { CANDIDATES, keyFor } from './_lib/common.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    const { token } = req.body || {};
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing token' });
    }
    const rec = await get(keyFor(token));
    if (!rec) {
      return res.status(404).json({ ok: false, error: 'Invalid token' });
    }
    return res.status(200).json({
      ok: true,
      role: rec.role,
      used: !!rec.used,
      candidates: CANDIDATES,
      token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}