import { get, set } from './_lib/kv.mjs';
import { CANDIDATES, keyFor } from './_lib/common.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    const { token, pick_male, pick_female } = req.body || {};
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing token' });
    }
    const key = keyFor(token);
    const rec = await get(key);
    if (!rec) {
      return res.status(404).json({ ok: false, error: 'Invalid token' });
    }
    if (rec.used) {
      return res.status(409).json({ ok: false, error: 'Token already used' });
    }
    const role = rec.role;
    if (role === 'male') {
      // must choose one male candidate
      if (!CANDIDATES.male.includes(pick_male)) {
        return res.status(400).json({ ok: false, error: 'Invalid male candidate' });
      }
      rec.vote_male = pick_male;
    } else if (role === 'female') {
      if (!CANDIDATES.female.includes(pick_female)) {
        return res.status(400).json({ ok: false, error: 'Invalid female candidate' });
      }
      rec.vote_female = pick_female;
    } else {
      // teacher or other role
      if (!CANDIDATES.male.includes(pick_male) || !CANDIDATES.female.includes(pick_female)) {
        return res.status(400).json({ ok: false, error: 'Invalid selection' });
      }
      rec.vote_male = pick_male;
      rec.vote_female = pick_female;
    }
    rec.used = true;
    rec.used_at = new Date().toISOString();
    await set(key, rec);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}