import { User, LeaderboardEntry } from './types';

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Alex Johnson',
  level: 'Active',
  points: 450,
  referrals: 3,
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'user-5', name: 'Emma Wilson', points: 1250, level: 'Expert', rank: 1 },
  { id: 'user-6', name: 'Michael Chen', points: 980, level: 'Expert', rank: 2 },
  { id: 'user-7', name: 'Sofia Rodriguez', points: 875, level: 'Active', rank: 3 },
  { id: 'user-1', name: 'Alex Johnson', points: 450, level: 'Active', rank: 4 },
  { id: 'user-8', name: 'James Smith', points: 420, level: 'Active', rank: 5 },
  { id: 'user-9', name: 'Olivia Brown', points: 380, level: 'Active', rank: 6 },
  { id: 'user-10', name: 'Noah Davis', points: 320, level: 'Novice', rank: 7 },
  { id: 'user-11', name: 'Ava Martinez', points: 280, level: 'Novice', rank: 8 },
  { id: 'user-12', name: 'Liam Anderson', points: 240, level: 'Novice', rank: 9 },
  { id: 'user-13', name: 'Isabella Taylor', points: 200, level: 'Novice', rank: 10 },
];

export const MOCK_PARTICIPANT_NAMES = [
  'Mike Thompson',
  'Sarah Williams',
  'David Lee',
  'Emily Davis',
  'Chris Martin',
  'Jessica Garcia',
  'Daniel White',
  'Ashley Lopez',
  'Matthew Harris',
  'Amanda Clark',
];
