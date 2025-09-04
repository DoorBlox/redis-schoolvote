import { scanIterator, mget } from '../_lib/kv.mjs';
import { CANDIDATES } from '../_lib/common.mjs';

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
    // gather all token records
    const keys = [];
    for await (const k of scanIterator('token:')) {
      keys.push(k);
    }
    const records = await mget(keys);
    // initialize tallies
    const maleCounts = {};
    const femaleCounts = {};
    CANDIDATES.male.forEach((c) => (maleCounts[c] = 0));
    CANDIDATES.female.forEach((c) => (femaleCounts[c] = 0));
    const totals = {
      male_total: 0,
      female_total: 0,
      teacher_total: 0,
      male_used: 0,
      female_used: 0,
      teacher_used: 0,
      all_used: 0
    };
    records.forEach((rec) => {
      if (!rec) return;
      if (rec.role === 'male') totals.male_total++;
      else if (rec.role === 'female') totals.female_total++;
      else totals.teacher_total++;
      if (rec.used) {
        totals.all_used++;
        if (rec.role === 'male') totals.male_used++;
        else if (rec.role === 'female') totals.female_used++;
        else totals.teacher_used++;
        if (rec.vote_male && maleCounts.hasOwnProperty(rec.vote_male)) {
          maleCounts[rec.vote_male]++;
        }
        if (rec.vote_female && femaleCounts.hasOwnProperty(rec.vote_female)) {
          femaleCounts[rec.vote_female]++;
        }
      }
    });
    const remaining = {
      male: totals.male_total - totals.male_used,
      female: totals.female_total - totals.female_used,
      teacher: totals.teacher_total - totals.teacher_used,
      all: totals.male_total + totals.female_total + totals.teacher_total - totals.all_used
    };
    return res.status(200).json({ ok: true, candidates: CANDIDATES, tally: { male: maleCounts, female: femaleCounts, totals }, remaining });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}