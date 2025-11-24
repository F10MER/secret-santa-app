import { Language } from './types';

export const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      secretSanta: 'Secret Santa',
      randomizers: 'Randomizers',
      profile: 'Profile',
    },
    // Home Tab
    home: {
      greeting: 'Hello',
      bonusPoints: 'Bonus Points',
      secretSantaCard: 'Secret Santa',
      secretSantaDesc: 'Organize gift exchanges',
      randomizersCard: 'Randomizers',
      randomizersDesc: 'Dice and Roulette',
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
    // Randomizers Tab
    randomizers: {
      title: 'Randomizers',
      diceRoller: 'Dice Roller',
      roulette: 'Roulette',
      rollDice: 'Roll Dice',
      rolling: 'Rolling...',
      total: 'Total',
      spinRoulette: 'Spin Roulette',
      spinning: 'Spinning...',
      winner: 'Winner',
      enterParticipant: 'Enter participant name',
      participantCount: 'Participants',
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
      shareWishlist: 'Share My Wishlist',
      wishlistLinkCopied: 'Wishlist link copied to clipboard!',
      linkCopied: 'Referral link copied to clipboard!',
      noWishlist: 'Your wishlist is empty. Add your first item!',
    },
    // Public Wishlist
    wishlist: {
      title: 'Wishlist',
      user: 'User',
      loading: 'Loading wishlist...',
      error: 'Failed to load wishlist',
      goHome: 'Go to Home',
      empty: 'No items yet',
      emptyDesc: 'This user hasn\'t added any items to their wishlist yet',
      public: 'Public',
      createYourOwn: 'Want to create your own wishlist?',
      startBot: 'Start Secret Santa Bot',
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
      randomizers: 'Рандомайзеры',
      profile: 'Профиль',
    },
    // Home Tab
    home: {
      greeting: 'Привет',
      bonusPoints: 'Бонусные Баллы',
      secretSantaCard: 'Тайный Санта',
      secretSantaDesc: 'Организуйте обмен подарками',
      randomizersCard: 'Рандомайзеры',
      randomizersDesc: 'Кубики и Рулетка',
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
    // Randomizers Tab
    randomizers: {
      title: 'Рандомайзеры',
      diceRoller: 'Бросить Кубики',
      roulette: 'Рулетка',
      rollDice: 'Бросить Кубики',
      rolling: 'Бросаем...',
      total: 'Сумма',
      spinRoulette: 'Запустить Рулетку',
      spinning: 'Крутится...',
      winner: 'Победитель',
      enterParticipant: 'Введите имя участника',
      participantCount: 'Участников',
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
      shareWishlist: 'Поделиться Списком Желаний',
      wishlistLinkCopied: 'Ссылка на список желаний скопирована!',
      linkCopied: 'Реферальная ссылка скопирована в буфер обмена!',
      noWishlist: 'Ваш список желаний пуст. Добавьте первый предмет!',
    },
    // Public Wishlist
    wishlist: {
      title: 'Список Желаний',
      user: 'Пользователь',
      loading: 'Загрузка списка желаний...',
      error: 'Не удалось загрузить список желаний',
      goHome: 'На Главную',
      empty: 'Пока нет предметов',
      emptyDesc: 'Этот пользователь ещё не добавил предметы в свой список желаний',
      public: 'Публичный',
      createYourOwn: 'Хотите создать свой список желаний?',
      startBot: 'Запустить Бота Secret Santa',
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
