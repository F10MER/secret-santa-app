import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';

export function DiceRoller() {
  const { t } = useLanguage();
  const [diceValues, setDiceValues] = useState<number[]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    
    // Animate rolling for 1 second
    const interval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      setIsRolling(false);
    }, 1000);
  };

  const renderDice = (value: number) => {
    const dots: Record<number, number[][]> = {
      1: [[1, 1]],
      2: [[0, 0], [2, 2]],
      3: [[0, 0], [1, 1], [2, 2]],
      4: [[0, 0], [0, 2], [2, 0], [2, 2]],
      5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
      6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
    };

    return (
      <div className="relative w-24 h-24 bg-white rounded-xl shadow-lg border-2 border-gray-300">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-3 gap-1">
          {Array.from({ length: 9 }).map((_, idx) => {
            const row = Math.floor(idx / 3);
            const col = idx % 3;
            const hasDot = dots[value].some(([r, c]) => r === row && c === col);
            
            return (
              <div
                key={idx}
                className={`rounded-full ${
                  hasDot ? 'bg-gray-800' : 'bg-transparent'
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6 text-center">{t.randomizers.diceRoller}</h3>
      
      <div className="flex justify-center gap-6 mb-8">
        <div className={isRolling ? 'animate-bounce' : ''}>
          {renderDice(diceValues[0])}
        </div>
        <div className={isRolling ? 'animate-bounce' : ''} style={{ animationDelay: '0.1s' }}>
          {renderDice(diceValues[1])}
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-primary">
          {t.randomizers.total}: {diceValues[0] + diceValues[1]}
        </p>
      </div>

      <Button
        onClick={rollDice}
        disabled={isRolling}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        size="lg"
      >
        {isRolling ? t.randomizers.rolling : t.randomizers.rollDice}
      </Button>
    </Card>
  );
}
