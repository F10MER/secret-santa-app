// Core data types for Secret Santa Telegram Mini App

export type Language = 'en' | 'ru';

export type UserLevel = 'Novice' | 'Active' | 'Expert';

export type EventStatus = 'Created' | 'Assigned';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  level: UserLevel;
  points: number;
  referrals: number;
}

export interface Participant {
  id: string;
  name: string;
}

export interface SantaEvent {
  id: string;
  name: string;
  minBudget: number;
  maxBudget: number;
  date: string;
  status: EventStatus;
  participants: Participant[];
  assignments?: Record<string, string>; // participantId -> recipientId
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: QuizQuestion[];
  points: number;
}

export interface WishlistItem {
  id: string;
  image: string;
  description: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  level: UserLevel;
  rank: number;
}

export interface WishlistPrivacy {
  visibility: 'all' | 'friends';
}
