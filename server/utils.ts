import crypto from 'crypto';

/**
 * Generate a unique invite code for Secret Santa events
 */
export function generateInviteCode(): string {
  return crypto.randomBytes(16).toString('hex').substring(0, 12).toUpperCase();
}

/**
 * Generate a shareable invite link for an event
 */
export function generateInviteLink(inviteCode: string, appUrl: string): string {
  return `${appUrl}?startapp=invite_${inviteCode}`;
}

/**
 * Parse invite code from Telegram start parameter
 */
export function parseInviteCode(startParam: string | undefined): string | null {
  if (!startParam) return null;
  const match = startParam.match(/^invite_([A-Z0-9]{12})$/);
  return match ? match[1] : null;
}

/**
 * Check if user has unlocked an achievement
 */
export function checkAchievement(
  type: 'events' | 'gifts_given' | 'gifts_received',
  count: number
): string[] {
  const achievements: string[] = [];
  
  if (type === 'events') {
    if (count === 1) achievements.push('first_event');
    if (count === 5) achievements.push('five_events');
    if (count === 10) achievements.push('ten_events');
  } else if (type === 'gifts_given' || type === 'gifts_received') {
    if (count === 1) achievements.push('first_gift');
    if (count === 5) achievements.push('five_gifts');
    if (count === 10) achievements.push('ten_gifts');
  }
  
  return achievements;
}
