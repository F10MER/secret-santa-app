import React from 'react';
import { HomeIcon, GiftIcon, BrainIcon, UserIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'home', label: t.nav.home, icon: HomeIcon },
    { id: 'santa', label: t.nav.secretSanta, icon: GiftIcon },
    { id: 'randomizers', label: t.nav.randomizers, icon: BrainIcon },
    { id: 'profile', label: t.nav.profile, icon: UserIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={24} className={isActive ? 'scale-110' : ''} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
