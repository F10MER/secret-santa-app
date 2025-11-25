import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '../components/SectionTitle';
import { TrophyIcon, GiftIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTelegram } from '../contexts/TelegramContext';
import { trpc } from '@/lib/trpc';

interface UserStats {
  eventsParticipated: number;
  giftsGiven: number;
  giftsReceived: number;
  wishlistItemsReserved: number;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface StatisticsPageProps {
  onBack: () => void;
}

export default function StatisticsPage({ onBack }: StatisticsPageProps) {
  const { language } = useLanguage();
  const { user: telegramUser } = useTelegram();
  const [stats, setStats] = useState<UserStats>({
    eventsParticipated: 0,
    giftsGiven: 0,
    giftsReceived: 0,
    wishlistItemsReserved: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const t = {
    en: {
      title: 'Statistics & Achievements',
      back: 'Back',
      stats: 'Your Statistics',
      eventsParticipated: 'Events Participated',
      giftsGiven: 'Gifts Given',
      giftsReceived: 'Gifts Received',
      wishlistReserved: 'Wishlist Items Reserved',
      achievements: 'Achievements',
      noAchievements: 'No achievements yet. Participate in events to unlock!',
      achievementTypes: {
        first_event: 'First Event',
        five_events: '5 Events',
        ten_events: '10 Events',
        first_gift: 'First Gift',
        generous: 'Generous',
        popular: 'Popular',
      },
    },
    ru: {
      title: 'Статистика и достижения',
      back: 'Назад',
      stats: 'Ваша статистика',
      eventsParticipated: 'Участие в событиях',
      giftsGiven: 'Подарков подарено',
      giftsReceived: 'Подарков получено',
      wishlistReserved: 'Желаний зарезервировано',
      achievements: 'Достижения',
      noAchievements: 'Пока нет достижений. Участвуйте в событиях чтобы разблокировать!',
      achievementTypes: {
        first_event: 'Первое событие',
        five_events: '5 событий',
        ten_events: '10 событий',
        first_gift: 'Первый подарок',
        generous: 'Щедрый',
        popular: 'Популярный',
      },
    },
  }[language];

  // Fetch statistics from API
  const { data: statsData } = trpc.features.statistics.getMyStats.useQuery(
    undefined,
    { enabled: !!telegramUser }
  );
  
  const { data: achievementsData = [] } = trpc.features.achievements.getMyAchievements.useQuery(
    undefined,
    { enabled: !!telegramUser }
  );

  useEffect(() => {
    if (statsData) {
      setStats({
        eventsParticipated: statsData.eventsParticipated || 0,
        giftsGiven: statsData.giftsGiven || 0,
        giftsReceived: statsData.giftsReceived || 0,
        wishlistItemsReserved: 0, // TODO: Add this field to schema
      });
    }

    if (achievementsData.length > 0) {
      setAchievements(achievementsData.map((a: any) => ({
        id: a.id.toString(),
        type: a.achievementType,
        title: t.achievementTypes[a.achievementType as keyof typeof t.achievementTypes] || a.achievementType,
        description: language === 'ru' ? 'Достижение разблокировано' : 'Achievement unlocked',
        icon: getAchievementIcon(a.achievementType),
        unlockedAt: a.unlockedAt.toISOString(),
      })));
    }
  }, [statsData, achievementsData, language]);

  const getAchievementIcon = (type: string) => {
    const icons: Record<string, string> = {
      first_event: '🎉',
      five_events: '🌟',
      ten_events: '⭐',
      first_gift: '🎁',
      generous: '💝',
      popular: '🔥',
    };
    return icons[type] || '🏆';
  };

  return (
    <div className="pb-20 px-4 pt-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <SectionTitle className="mb-0">{t.title}</SectionTitle>
        <Button variant="outline" onClick={onBack} size="sm">
          {t.back}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{t.stats}</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{stats.eventsParticipated}</div>
            <div className="text-sm text-muted-foreground mt-1">{t.eventsParticipated}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.giftsGiven}</div>
            <div className="text-sm text-muted-foreground mt-1">{t.giftsGiven}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.giftsReceived}</div>
            <div className="text-sm text-muted-foreground mt-1">{t.giftsReceived}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.wishlistItemsReserved}</div>
            <div className="text-sm text-muted-foreground mt-1">{t.wishlistReserved}</div>
          </Card>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrophyIcon size={24} />
          {t.achievements}
        </h3>
        {achievements.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <TrophyIcon size={48} className="mx-auto mb-3 opacity-30" />
            <p>{t.noAchievements}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <Card
                key={achievement.id}
                className="p-4 flex items-center gap-4 stagger-item animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl">{getAchievementIcon(achievement.type)}</div>
                <div className="flex-1">
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(achievement.unlockedAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
