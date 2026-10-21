import { createHash } from 'node:crypto';
import { renderEmail } from './email-templates.js';

export const BASE = 'https://reckoningfigures.com/';
export const WINDOW = 20 * 60 * 60 * 1000; // shorter than Resend's 24h idempotency retention
export const MAX_ATTEMPTS = 8;
export const hash = value => createHash('sha256').update(value).digest('hex');
export const millis = value => value?.toMillis?.() ?? NaN;
const validEmail = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
export const licenseOpen = (school, now) => school && ['pilot', 'active'].includes(school.status)
  && millis(school.license?.startsOn) <= now && millis(school.license?.endsOn) > now;

// Read recipients/permissions again immediately before sending; callers cannot supply email bodies or URLs.
export async function prepareMail(kind, id, { read, user }, now = Date.now()) {
  if (!validId(id)) return null;
  let to, data, school;
  if (kind === 'pilot') {
    const app = await read(`pilotApplications/${id}`);
    if (!app || app.uid !== id || !app.consent || app.status === 'closed') return null;
    const account = await user(id);
    if (!account || account.disabled || !account.emailVerified || account.email?.toLowerCase() !== app.email?.toLowerCase()) return null;
    to = app.email;
    data = { actionUrl: BASE };
  } else if (kind === 'invite' || kind === 'welcome') {
    const invite = await read(`staffInvites/${id}`);
    if (!invite || !validId(invite.schoolId) || !validId(invite.createdBy) || !['teacher', 'administrator'].includes(invite.role)) return null;
    school = await read(`schools/${invite.schoolId}`);
    if (!licenseOpen(school, now)) return null;
    to = invite.email;
    if (kind === 'invite') {
      if (invite.state !== 'pending' || !(millis(invite.expiresAt) > now)) return null;
      const owner = await read(`platformOwners/${invite.createdBy}`);
      const issuer = await read(`schools/${invite.schoolId}/members/${invite.createdBy}`);
      if (!(owner?.active || (invite.role === 'teacher' && issuer?.state === 'active' && issuer.role === 'administrator'))) return null;
      data = { schoolName: school.name, role: invite.role, invitedEmail: to,
        expiresText: new Date(millis(invite.expiresAt)).toUTCString(),
        actionUrl: `${BASE}preview/school/staff-join.html?invite=${encodeURIComponent(id)}` };
    } else {
      if (invite.state !== 'accepted' || !validId(invite.acceptedBy)) return null;
      const member = await read(`schools/${invite.schoolId}/members/${invite.acceptedBy}`);
      const account = await user(invite.acceptedBy);
      if (member?.state !== 'active' || member.role !== invite.role || !account || account.disabled || !account.emailVerified || account.email?.toLowerCase() !== to?.toLowerCase()) return null;
      data = { schoolName: school.name, actionUrl: `${BASE}preview/school/?school=${encodeURIComponent(invite.schoolId)}` };
    }
  } else return null;
  if (!validEmail(to)) return null;
  const rendered = renderEmail(kind, { ...data, logoUrl: `${BASE}preview/assets/brand-transparent.png`,
    helpText: 'Need help? Reply to this email to contact the Reckoning Figures schools team.' });
  return { from: 'Reckoning Figures Schools <schools@reckoningfigures.com>',
    to: [to.toLowerCase()], reply_to: 'schools@reckoningfigures.com', ...rendered };
}

export function claimDecision(record, eventTime, now) {
  if (['sent', 'failed', 'skipped'].includes(record?.state)) return 'done';
  if (!Number.isFinite(eventTime) || now - eventTime >= WINDOW || (record?.attempts || 0) >= MAX_ATTEMPTS) return 'failed';
  if ((record?.leaseUntil || 0) > now) return 'busy';
  return 'claim';
}

export async function postEmail(payload, key, idempotencyKey, fetcher = fetch) {
  let response;
  try {
    response = await fetcher('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(15000)
    });
  } catch { return { retry: true, code: 'network' }; }
  if (!response.ok) return { retry: response.status === 429 || response.status >= 500 || response.status === 409,
    code: `http_${response.status}` };
  try {
    const result = await response.json();
    return typeof result.id === 'string' ? { id: result.id } : { retry: true, code: 'invalid_response' };
  } catch { return { retry: true, code: 'invalid_response' }; }
}
