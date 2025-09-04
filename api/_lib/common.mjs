import { customAlphabet } from 'nanoid';

// Candidate lists for the election.  Feel free to modify these
// arrays to reflect the actual candidates.  The admin and vote
// endpoints rely on the keys 'male' and 'female'.  Teachers vote
// for both a male and a female candidate.
export const CANDIDATES = {
  male: ['Candidate M1', 'Candidate M2', 'Candidate M3'],
  female: ['Candidate F1', 'Candidate F2', 'Candidate F3']
};

// Generate a random identifier.  We use nanoid for high entropy.
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const nanoid8 = customAlphabet(alphabet, 8);
const nanoid16 = customAlphabet(alphabet, 16);

export function genId(length = 8) {
  return length === 8 ? nanoid8() : nanoid16();
}

// Construct the Redis key for a given token.
export function keyFor(token) {
  return `token:${token}`;
}

// Build a human-readable vote label from a record.  For male or
// female roles, returns the selected candidate; for teachers,
// returns a combination "male / female".
export function buildVoteLabel(record) {
  if (!record) return '';
  const { role, vote_male, vote_female } = record;
  if (role === 'male') return vote_male || '';
  if (role === 'female') return vote_female || '';
  // teacher or other
  const maleName = vote_male || '-';
  const femaleName = vote_female || '-';
  return `${maleName} / ${femaleName}`;
}

// Tagline to display on pages.  Feel free to customise.  We use
// newline separation to allow easy formatting on the page.
export const TAGLINE = 'school vote app made by hisyam - 4ever - @2025';