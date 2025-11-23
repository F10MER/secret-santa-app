import React from 'react';
import { Card } from '@/components/ui/card';
import { GiftIcon, BrainIcon, TrophyIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { MOCK_USER } from '../constants';

interface HomeTabProps {
  onNavigate: (tab: string) => void;
}

export default function HomeTab({ onNavigate }: HomeTabProps) {
  const { t } = useLanguage();

  return (
    <div className="pb-20 px-4 pt-6 animate-fade-in">
      {/* Greeting Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {t.home.greeting}, {MOCK_USER.name.split(' ')[0]}! 👋
        </h1>
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
          <span className="text-lg font-semibold">{t.home.bonusPoints}</span>
          <span className="text-2xl font-bold">{MOCK_USER.points}</span>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="space-y-4 mb-6">
        {/* Secret Santa Card */}
        <Card
          className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-6 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl stagger-item"
          onClick={() => onNavigate('santa')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{t.home.secretSantaCard}</h2>
              <p className="text-white/90">{t.home.secretSantaDesc}</p>
            </div>
            <GiftIcon className="text-white/80" size={48} />
          </div>
        </Card>

        {/* Quizzes Card */}
        <Card
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl stagger-item"
          onClick={() => onNavigate('quizzes')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{t.home.quizzesCard}</h2>
              <p className="text-white/90">{t.home.quizzesDesc}</p>
            </div>
            <BrainIcon className="text-white/80" size={48} />
          </div>
        </Card>
      </div>

      {/* Leaderboard Banner */}
      <Card
        className="bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 p-5 cursor-pointer hover:scale-[1.02] transition-transform shadow-lg stagger-item"
        onClick={() => onNavigate('profile')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrophyIcon className="text-gray-900" size={32} />
            <span className="text-xl font-bold">{t.home.leaderboardBanner}</span>
          </div>
          <span className="text-2xl">→</span>
        </div>
      </Card>
    </div>
  );
}
