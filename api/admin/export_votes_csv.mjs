import { scanIterator, mget } from '../_lib/kv.mjs';
import { buildVoteLabel } from '../_lib/common.mjs';

export default async function handler(req, res) {
  const adminKey = process.env.ADMIN_KEY;
  const provided = (req.query.admin_key || '').trim();
  if (!adminKey || provided !== adminKey) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }
  try {
    const keys = [];
    for await (const k of scanIterator('token:')) {
      keys.push(k);
    }
    const records = await mget(keys);
    const rows = [];
    // header
    rows.push(['time', 'token', 'role', 'vote_male', 'vote_female', 'vote']);
    records.forEach((rec) => {
      if (!rec || !rec.used) return;
      rows.push([rec.used_at, rec.token, rec.role, rec.vote_male || '', rec.vote_female || '', buildVoteLabel(rec)]);
    });
    const csv = rows.map((r) => r.map((x) => {
      const s = String(x);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(',')).join('\n');
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const filename = `Votes-${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}