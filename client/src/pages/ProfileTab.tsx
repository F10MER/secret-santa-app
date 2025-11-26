import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '../components/SectionTitle';
import {
  UserIcon,
  TrophyIcon,
  CameraIcon,
  LockIcon,
  ShareIcon,
  PlusIcon,
  GiftIcon,
} from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTelegram } from '../contexts/TelegramContext';
import { useTheme } from '../contexts/ThemeContext';
import { MOCK_USER, MOCK_LEADERBOARD } from '../constants';
import { WishlistItem } from '../types';
import { toast } from 'sonner';
import MyReservations from './MyReservations';
import StatisticsPage from './StatisticsPage';
import FriendsPage from './FriendsPage';
import { AddWishlistItemDialog } from '../components/AddWishlistItemDialog';
import { trpc } from '@/lib/trpc';

export default function ProfileTab() {
  const { t, language, setLanguage } = useLanguage();
  const { user: telegramUser } = useTelegram();
  const { theme, toggleTheme } = useTheme();
  
  // Fetch current user data from API
  const { data: currentUser } = trpc.auth.me.useQuery();
  
  // Use real Telegram user data if available, fallback to MOCK_USER
  const user = telegramUser
    ? {
        id: telegramUser.id.toString(),
        name: `${telegramUser.firstName}${telegramUser.lastName ? ' ' + telegramUser.lastName : ''}`,
        level: MOCK_USER.level,
        points: currentUser?.points ?? MOCK_USER.points,
        referrals: MOCK_USER.referrals,
      }
    : MOCK_USER;

  // Fetch user avatar from Telegram
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    if (telegramUser) {
      // Try to get avatar from backend API
      fetch(`/api/telegram-avatar/${telegramUser.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
          }
        })
        .catch(() => {});
    }
  }, [telegramUser]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMyReservations, setShowMyReservations] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [wishlistPrivacy, setWishlistPrivacy] = useState<'all' | 'friends'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch wishlist from API
  const { data: wishlistItems = [], refetch: refetchWishlist } = trpc.wishlist.getMy.useQuery();
  const createWishlistItem = trpc.wishlist.create.useMutation({
    onSuccess: () => {
      refetchWishlist();
      toast.success(language === 'ru' ? 'Желание добавлено!' : 'Item added!');
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ru' ? 'Ошибка при добавлении' : 'Failed to add item'));
    },
  });

  const handleAddWishlistItem = async (item: {
    title: string;
    description: string;
    productLink?: string;
    imageUrl?: string;
  }) => {
    createWishlistItem.mutate({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      privacy: wishlistPrivacy,
    });
  };

  const handleShareReferral = () => {
    const referralLink = `https://t.me/SecretSantaBot?start=${user.id}`;
    navigator.clipboard.writeText(referralLink);
    toast.success(t.profile.linkCopied);
  };

  const handleShareWishlist = () => {
    const wishlistLink = `${window.location.origin}/wishlist/${user.id}?name=${encodeURIComponent(user.name)}`;
    navigator.clipboard.writeText(wishlistLink);
    toast.success(t.profile.wishlistLinkCopied);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Friends View
  if (showFriends) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4 px-4 pt-6">
          <Button variant="outline" onClick={() => setShowFriends(false)} size="sm">
            {language === 'ru' ? '← Назад' : '← Back'}
          </Button>
        </div>
        <FriendsPage />
      </div>
    );
  }

  // My Reservations View
  if (showMyReservations) {
    return <MyReservations onBack={() => setShowMyReservations(false)} />;
  }

  // Statistics View
  if (showStatistics) {
    return <StatisticsPage onBack={() => setShowStatistics(false)} />;
  }

  // Leaderboard Modal
  if (showLeaderboard) {
    return (
      <div className="pb-20 px-4 pt-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle className="mb-0">{t.profile.leaderboard}</SectionTitle>
          <Button variant="outline" onClick={() => setShowLeaderboard(false)} size="sm">
            {t.profile.close}
          </Button>
        </div>

        <div className="space-y-2">
          {MOCK_LEADERBOARD.map((entry, index) => (
            <Card
              key={entry.id}
              className={`p-4 stagger-item ${
                entry.id === user.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold w-8 text-center">
                  {entry.rank <= 3 ? (
                    <span>
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{entry.rank}</span>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {getInitials(entry.name)}
                </div>
                <div className="flex-1">
                  <p className="font-bold">
                    {entry.name}
                    {entry.id === user.id && (
                      <span className="ml-2 text-xs text-primary">({t.profile.you})</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{entry.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{entry.points}</p>
                  <p className="text-xs text-muted-foreground">{t.profile.points}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Main Profile View
  return (
    <div className="pb-20 px-4 pt-6 animate-fade-in">
      {/* User Header */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="flex items-start gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {getInitials(user.name)}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-white/90 mb-3">{user.level}</p>
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-white/80">{t.profile.referrals}</p>
                <p className="text-xl font-bold">{user.referrals}</p>
              </div>
              <div>
                <p className="text-sm text-white/80">{t.profile.points}</p>
                <p className="text-xl font-bold">{user.points}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Leaderboard Button */}
      <Button
        onClick={() => setShowLeaderboard(true)}
        className="w-full mb-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900"
      >
        <TrophyIcon size={20} className="mr-2" />
        {t.profile.leaderboard}
      </Button>

      {/* Statistics Button */}
      <Button
        onClick={() => setShowStatistics(true)}
        className="w-full mb-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
      >
        <TrophyIcon size={20} className="mr-2" />
        {language === 'ru' ? 'Статистика и достижения' : 'Statistics & Achievements'}
      </Button>

      {/* Friends Button */}
      <Button
        onClick={() => setShowFriends(true)}
        className="w-full mb-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
      >
        <UserIcon size={20} className="mr-2" />
        {language === 'ru' ? 'Друзья' : 'Friends'}
      </Button>

      {/* My Reservations Button */}
      <Button
        onClick={() => setShowMyReservations(true)}
        className="w-full mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
      >
        <GiftIcon size={20} className="mr-2" />
        {t.reservations.title}
      </Button>

      {/* Wishlist Section */}
      <SectionTitle>{t.profile.wishlist}</SectionTitle>
      
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <LockIcon size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground">{t.profile.privacy}:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setWishlistPrivacy('all')}
              className={`px-3 py-1 rounded ${
                wishlistPrivacy === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {t.profile.all}
            </button>
            <button
              onClick={() => setWishlistPrivacy('friends')}
              className={`px-3 py-1 rounded ${
                wishlistPrivacy === 'friends'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {t.profile.friendsOnly}
            </button>
          </div>
        </div>
      </div>

      <Button
        onClick={() => setShowAddDialog(true)}
        variant="outline"
        className="w-full mb-4"
      >
        <PlusIcon className="mr-2" />
        {t.profile.addItem}
      </Button>

      <AddWishlistItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddWishlistItem}
      />

      {wishlistItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CameraIcon size={48} className="mx-auto mb-3 opacity-30" />
          <p>{t.profile.noWishlist}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {wishlistItems.map((item, index) => (
            <Card
              key={item.id}
              className="overflow-hidden stagger-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={item.imageUrl || '/placeholder.png'}
                alt={item.description || item.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-2">
                <p className="text-sm font-medium line-clamp-2">{item.description || item.title}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Settings Section */}
      <SectionTitle>{t.profile.settings}</SectionTitle>

      {/* Theme Switcher */}
      {toggleTheme && (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{language === 'ru' ? 'Тема' : 'Theme'}</span>
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{
                backgroundColor: theme === 'light' ? '#e5e7eb' : '#374151',
              }}
              aria-label={language === 'ru' ? 'Переключить тему' : 'Toggle theme'}
            >
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg transform transition-transform duration-200"
                style={{
                  transform: theme === 'light' ? 'translateX(4px)' : 'translateX(44px)',
                }}
              >
                {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </Card>
      )}

      {/* Language Switcher */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">{t.profile.language}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ru')}
              className={`px-4 py-2 rounded ${
                language === 'ru'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              RU
            </button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <Button
          onClick={handleShareWishlist}
          variant="outline"
          className="w-full"
        >
          <ShareIcon size={20} className="mr-2" />
          {t.profile.shareWishlist}
        </Button>
        
        <Button
          onClick={handleShareReferral}
          variant="outline"
          className="w-full"
        >
          <ShareIcon size={20} className="mr-2" />
          {t.profile.shareReferral}
        </Button>
      </div>
    </div>
  );
}
