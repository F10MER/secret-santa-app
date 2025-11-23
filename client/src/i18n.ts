import { Language } from './types';

export const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      secretSanta: 'Secret Santa',
      quizzes: 'Quizzes',
      profile: 'Profile',
    },
    // Home Tab
    home: {
      greeting: 'Hello',
      bonusPoints: 'Bonus Points',
      secretSantaCard: 'Secret Santa',
      secretSantaDesc: 'Organize gift exchanges',
      quizzesCard: 'Quizzes',
      quizzesDesc: 'Test your knowledge',
      leaderboardBanner: 'View Leaderboard',
    },
    // Secret Santa Tab
    santa: {
      title: 'Secret Santa Events',
      createNew: 'Create New Event',
      eventName: 'Event Name',
      minBudget: 'Min Budget',
      maxBudget: 'Max Budget',
      eventDate: 'Event Date',
      createButton: 'Create Event',
      addParticipant: 'Add Mock Participant',
      drawNames: 'Draw Names',
      yourRecipient: 'You are the Secret Santa for:',
      participants: 'Participants',
      status: 'Status',
      created: 'Created',
      assigned: 'Assigned',
      noEvents: 'No events yet. Create your first Secret Santa event!',
    },
    // Quizzes Tab
    quizzes: {
      title: 'Available Quizzes',
      start: 'Start Quiz',
      next: 'Next',
      finish: 'Finish',
      progress: 'Question',
      of: 'of',
      success: 'Quiz Completed!',
      earnedPoints: 'You earned',
      points: 'points',
      backToList: 'Back to Quizzes',
    },
    // Profile Tab
    profile: {
      title: 'Profile',
      level: 'Level',
      referrals: 'Referrals',
      points: 'Points',
      leaderboard: 'Leaderboard',
      topUsers: 'Top Users',
      rank: 'Rank',
      you: 'You',
      close: 'Close',
      wishlist: 'My Wishlist',
      addItem: 'Add Item',
      privacy: 'Privacy',
      all: 'All',
      friendsOnly: 'Friends Only',
      settings: 'Settings',
      language: 'Language',
      shareReferral: 'Share Referral Link',
      linkCopied: 'Referral link copied to clipboard!',
      noWishlist: 'Your wishlist is empty. Add your first item!',
    },
    // Common
    common: {
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
    },
  },
  ru: {
    // Navigation
    nav: {
      home: 'Главная',
      secretSanta: 'Тайный Санта',
      quizzes: 'Викторины',
      profile: 'Профиль',
    },
    // Home Tab
    home: {
      greeting: 'Привет',
      bonusPoints: 'Бонусные Баллы',
      secretSantaCard: 'Тайный Санта',
      secretSantaDesc: 'Организуйте обмен подарками',
      quizzesCard: 'Викторины',
      quizzesDesc: 'Проверьте свои знания',
      leaderboardBanner: 'Таблица Лидеров',
    },
    // Secret Santa Tab
    santa: {
      title: 'События Тайного Санты',
      createNew: 'Создать Новое Событие',
      eventName: 'Название События',
      minBudget: 'Мин. Бюджет',
      maxBudget: 'Макс. Бюджет',
      eventDate: 'Дата События',
      createButton: 'Создать Событие',
      addParticipant: 'Добавить Участника',
      drawNames: 'Провести Жеребьёвку',
      yourRecipient: 'Вы — Тайный Санта для:',
      participants: 'Участники',
      status: 'Статус',
      created: 'Создано',
      assigned: 'Назначено',
      noEvents: 'Событий пока нет. Создайте своё первое событие Тайного Санты!',
    },
    // Quizzes Tab
    quizzes: {
      title: 'Доступные Викторины',
      start: 'Начать Викторину',
      next: 'Далее',
      finish: 'Завершить',
      progress: 'Вопрос',
      of: 'из',
      success: 'Викторина Завершена!',
      earnedPoints: 'Вы заработали',
      points: 'баллов',
      backToList: 'Назад к Викторинам',
    },
    // Profile Tab
    profile: {
      title: 'Профиль',
      level: 'Уровень',
      referrals: 'Рефералы',
      points: 'Баллы',
      leaderboard: 'Таблица Лидеров',
      topUsers: 'Топ Пользователей',
      rank: 'Место',
      you: 'Вы',
      close: 'Закрыть',
      wishlist: 'Мой Список Желаний',
      addItem: 'Добавить Предмет',
      privacy: 'Приватность',
      all: 'Все',
      friendsOnly: 'Только Друзья',
      settings: 'Настройки',
      language: 'Язык',
      shareReferral: 'Поделиться Реферальной Ссылкой',
      linkCopied: 'Реферальная ссылка скопирована в буфер обмена!',
      noWishlist: 'Ваш список желаний пуст. Добавьте первый предмет!',
    },
    // Common
    common: {
      cancel: 'Отмена',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      loading: 'Загрузка...',
    },
  },
};

export type TranslationKeys = typeof translations.en;

export function getTranslation(lang: Language): TranslationKeys {
  return translations[lang];
}
