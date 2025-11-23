import React, { useState } from 'react';
import { SectionTitle } from '../components/SectionTitle';
import { DiceRoller } from '../components/DiceRoller';
import { Roulette } from '../components/Roulette';
import { useLanguage } from '../contexts/LanguageContext';

export default function RandomizersTab() {
  const { t } = useLanguage();
  const [activeRandomizer, setActiveRandomizer] = useState<'dice' | 'roulette'>('dice');

  return (
    <div className="pb-20 px-4 pt-6 animate-fade-in">
      <SectionTitle>{t.randomizers.title}</SectionTitle>

      {/* Tab Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveRandomizer('dice')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeRandomizer === 'dice'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          🎲 {t.randomizers.diceRoller}
        </button>
        <button
          onClick={() => setActiveRandomizer('roulette')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeRandomizer === 'roulette'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          🎡 {t.randomizers.roulette}
        </button>
      </div>

      {/* Active Randomizer */}
      <div className="animate-fade-in">
        {activeRandomizer === 'dice' ? <DiceRoller /> : <Roulette />}
      </div>
    </div>
  );
}
