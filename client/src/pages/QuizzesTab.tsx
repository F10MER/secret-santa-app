import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '../components/SectionTitle';
import { BrainIcon, TrophyIcon, GiftIcon, CheckIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getQuizzes } from '../constants';
import { Quiz, QuizQuestion } from '../types';

export default function QuizzesTab() {
  const { t, language } = useLanguage();
  const quizzes = getQuizzes(language);
  
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const getQuizIcon = (iconName: string) => {
    switch (iconName) {
      case 'brain':
        return <BrainIcon size={40} />;
      case 'trophy':
        return <TrophyIcon size={40} />;
      case 'gift':
        return <GiftIcon size={40} />;
      default:
        return <BrainIcon size={40} />;
    }
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowCompletion(false);
  };

  const handleNextQuestion = () => {
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowCompletion(true);
    }
  };

  const handleBackToList = () => {
    setActiveQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowCompletion(false);
  };

  // Quiz List View
  if (!activeQuiz) {
    return (
      <div className="pb-20 px-4 pt-6 animate-fade-in">
        <SectionTitle>{t.quizzes.title}</SectionTitle>
        
        <div className="space-y-4">
          {quizzes.map((quiz, index) => (
            <Card
              key={quiz.id}
              className="p-5 cursor-pointer hover:scale-[1.02] transition-transform stagger-item"
              onClick={() => handleStartQuiz(quiz)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  {getQuizIcon(quiz.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{quiz.description}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">
                      {quiz.questions.length} {t.quizzes.progress}s
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      +{quiz.points} {t.quizzes.points}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Completion View
  if (showCompletion) {
    return (
      <div className="pb-20 px-4 pt-6 flex items-center justify-center min-h-[80vh] animate-scale-in">
        <div className="text-center">
          <div className="mb-6 animate-bounce">
            <CheckIcon size={80} className="mx-auto text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{t.quizzes.success}</h2>
          <p className="text-xl mb-2">
            {t.quizzes.earnedPoints}{' '}
            <span className="text-green-600 dark:text-green-400 font-bold text-2xl">
              {activeQuiz.points}
            </span>{' '}
            {t.quizzes.points}!
          </p>
          <Button
            onClick={handleBackToList}
            className="mt-6"
            size="lg"
          >
            {t.quizzes.backToList}
          </Button>
        </div>
      </div>
    );
  }

  // Quiz View
  const currentQuestion: QuizQuestion = activeQuiz.questions[currentQuestionIndex];
  const progress = currentQuestionIndex + 1;
  const total = activeQuiz.questions.length;

  return (
    <div className="pb-20 px-4 pt-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{activeQuiz.title}</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t.quizzes.progress} {progress} {t.quizzes.of} {total}
          </span>
          <div className="flex-1 mx-4 bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{Math.round((progress / total) * 100)}%</span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-6 mb-6 animate-slide-up">
        <h3 className="text-xl font-bold mb-6">{currentQuestion.question}</h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(index)}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                selectedAnswer === index
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index
                      ? 'border-primary-foreground bg-primary-foreground'
                      : 'border-muted-foreground'
                  }`}
                >
                  {selectedAnswer === index && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleBackToList}
          className="flex-1"
        >
          {t.common.cancel}
        </Button>
        <Button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          className="flex-1"
        >
          {currentQuestionIndex < activeQuiz.questions.length - 1
            ? t.quizzes.next
            : t.quizzes.finish}
        </Button>
      </div>
    </div>
  );
}
