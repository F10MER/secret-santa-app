import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GiftIcon, UserIcon, BrainIcon, TrophyIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: GiftIcon,
      title: language === 'ru' ? 'Добро пожаловать!' : 'Welcome!',
      description: language === 'ru' 
        ? 'Организуйте идеальный обмен подарками с друзьями и коллегами через Telegram' 
        : 'Organize the perfect gift exchange with friends and colleagues via Telegram',
      gradient: 'from-red-500 to-pink-600',
    },
    {
      icon: UserIcon,
      title: language === 'ru' ? 'Создавайте события' : 'Create Events',
      description: language === 'ru'
        ? 'Создайте событие Тайный Санта, пригласите участников по ссылке и проведите жеребьевку'
        : 'Create a Secret Santa event, invite participants via link, and draw names',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      icon: TrophyIcon,
      title: language === 'ru' ? 'Список желаний' : 'Wishlist',
      description: language === 'ru'
        ? 'Создайте свой wishlist с фото и описанием, чтобы ваш Санта знал что вам подарить'
        : 'Create your wishlist with photos and descriptions so your Santa knows what to gift',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      icon: BrainIcon,
      title: language === 'ru' ? 'Рандомайзеры' : 'Randomizers',
      description: language === 'ru'
        ? 'Используйте встроенные рандомайзеры: кости, рулетку и генератор случайных чисел'
        : 'Use built-in randomizers: dice, roulette, and random number generator',
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        {language === 'ru' ? 'Пропустить' : 'Skip'}
      </button>

      {/* Slide content */}
      <Card className={`w-full max-w-md p-8 text-center animate-scale-in bg-gradient-to-br ${currentSlideData.gradient} text-white border-0`}>
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Icon size={48} />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-4">{currentSlideData.title}</h2>
        <p className="text-lg opacity-90 leading-relaxed">
          {currentSlideData.description}
        </p>
      </Card>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8 mb-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-primary w-8'
                : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-4 w-full max-w-md">
        {currentSlide > 0 && (
          <Button
            onClick={handlePrev}
            variant="outline"
            className="flex-1"
          >
            {language === 'ru' ? 'Назад' : 'Back'}
          </Button>
        )}
        <Button
          onClick={handleNext}
          className="flex-1"
        >
          {isLastSlide
            ? (language === 'ru' ? 'Начать!' : 'Get Started!')
            : (language === 'ru' ? 'Далее' : 'Next')}
        </Button>
      </div>
    </div>
  );
}
