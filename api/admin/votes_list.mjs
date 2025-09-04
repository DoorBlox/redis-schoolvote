import { scanIterator, mget } from '../_lib/kv.mjs';
import { buildVoteLabel } from '../_lib/common.mjs';

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
    const keys = [];
    for await (const k of scanIterator('token:')) {
      keys.push(k);
    }
    const records = await mget(...keys);
    const items = [];
    records.forEach((rec) => {
      if (!rec || !rec.used) return;
      items.push({
        token: rec.token,
        role: rec.role,
        vote_male: rec.vote_male,
        vote_female: rec.vote_female,
        used_at: rec.used_at,
        vote: buildVoteLabel(rec)
      });
    });
    // sort by used_at ascending
    items.sort((a, b) => {
      return new Date(a.used_at) - new Date(b.used_at);
    });
    return res.status(200).json({ ok: true, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
