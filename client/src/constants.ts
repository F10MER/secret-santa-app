import { User, LeaderboardEntry, Quiz, Language } from './types';

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Alex Johnson',
  level: 'Active',
  points: 450,
  referrals: 3,
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'user-5', name: 'Emma Wilson', points: 1250, level: 'Expert', rank: 1 },
  { id: 'user-6', name: 'Michael Chen', points: 980, level: 'Expert', rank: 2 },
  { id: 'user-7', name: 'Sofia Rodriguez', points: 875, level: 'Active', rank: 3 },
  { id: 'user-1', name: 'Alex Johnson', points: 450, level: 'Active', rank: 4 },
  { id: 'user-8', name: 'James Smith', points: 420, level: 'Active', rank: 5 },
  { id: 'user-9', name: 'Olivia Brown', points: 380, level: 'Active', rank: 6 },
  { id: 'user-10', name: 'Noah Davis', points: 320, level: 'Novice', rank: 7 },
  { id: 'user-11', name: 'Ava Martinez', points: 280, level: 'Novice', rank: 8 },
  { id: 'user-12', name: 'Liam Anderson', points: 240, level: 'Novice', rank: 9 },
  { id: 'user-13', name: 'Isabella Taylor', points: 200, level: 'Novice', rank: 10 },
];

export const MOCK_PARTICIPANT_NAMES = [
  'Mike Thompson',
  'Sarah Williams',
  'David Lee',
  'Emily Davis',
  'Chris Martin',
  'Jessica Garcia',
  'Daniel White',
  'Ashley Lopez',
  'Matthew Harris',
  'Amanda Clark',
];

export function getQuizzes(lang: Language): Quiz[] {
  const quizzes: Record<Language, Quiz[]> = {
    en: [
      {
        id: 'quiz-1',
        title: 'Personality Quiz',
        description: 'Discover your unique personality type',
        icon: 'brain',
        points: 50,
        questions: [
          {
            id: 'q1',
            question: 'How do you prefer to spend your free time?',
            options: [
              'Reading a book',
              'Going out with friends',
              'Watching movies',
              'Playing sports',
            ],
            correctAnswer: 0,
          },
          {
            id: 'q2',
            question: 'What describes you best?',
            options: [
              'Introverted and thoughtful',
              'Extroverted and energetic',
              'Creative and artistic',
              'Analytical and logical',
            ],
            correctAnswer: 1,
          },
          {
            id: 'q3',
            question: 'Your ideal vacation would be:',
            options: [
              'A quiet beach resort',
              'An adventure in the mountains',
              'Exploring a new city',
              'Staying home and relaxing',
            ],
            correctAnswer: 2,
          },
          {
            id: 'q4',
            question: 'How do you handle stress?',
            options: [
              'Talk to friends',
              'Exercise or physical activity',
              'Meditation or quiet time',
              'Work through it',
            ],
            correctAnswer: 0,
          },
          {
            id: 'q5',
            question: 'What motivates you most?',
            options: [
              'Helping others',
              'Achieving goals',
              'Learning new things',
              'Having fun',
            ],
            correctAnswer: 2,
          },
        ],
      },
      {
        id: 'quiz-2',
        title: 'General Trivia',
        description: 'Test your general knowledge',
        icon: 'trophy',
        points: 75,
        questions: [
          {
            id: 'q1',
            question: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correctAnswer: 2,
          },
          {
            id: 'q2',
            question: 'Which planet is known as the Red Planet?',
            options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
            correctAnswer: 1,
          },
          {
            id: 'q3',
            question: 'Who painted the Mona Lisa?',
            options: [
              'Vincent van Gogh',
              'Pablo Picasso',
              'Leonardo da Vinci',
              'Michelangelo',
            ],
            correctAnswer: 2,
          },
          {
            id: 'q4',
            question: 'What is the largest ocean on Earth?',
            options: [
              'Atlantic Ocean',
              'Indian Ocean',
              'Arctic Ocean',
              'Pacific Ocean',
            ],
            correctAnswer: 3,
          },
          {
            id: 'q5',
            question: 'In which year did World War II end?',
            options: ['1943', '1944', '1945', '1946'],
            correctAnswer: 2,
          },
        ],
      },
      {
        id: 'quiz-3',
        title: 'Holiday Traditions',
        description: 'How well do you know holiday customs?',
        icon: 'gift',
        points: 60,
        questions: [
          {
            id: 'q1',
            question: 'Which country started the tradition of putting up a Christmas tree?',
            options: ['USA', 'Germany', 'England', 'France'],
            correctAnswer: 1,
          },
          {
            id: 'q2',
            question: 'What do people traditionally put on top of a Christmas tree?',
            options: ['A star', 'A bell', 'A snowflake', 'A wreath'],
            correctAnswer: 0,
          },
          {
            id: 'q3',
            question: 'In which country is it tradition to eat KFC for Christmas?',
            options: ['China', 'Japan', 'Korea', 'Thailand'],
            correctAnswer: 1,
          },
          {
            id: 'q4',
            question: 'What is the name of the reindeer with a red nose?',
            options: ['Dasher', 'Rudolph', 'Blitzen', 'Comet'],
            correctAnswer: 1,
          },
          {
            id: 'q5',
            question: 'How many gifts are given in total in "The Twelve Days of Christmas"?',
            options: ['144', '78', '364', '156'],
            correctAnswer: 2,
          },
        ],
      },
    ],
    ru: [
      {
        id: 'quiz-1',
        title: 'Тест на Личность',
        description: 'Откройте свой уникальный тип личности',
        icon: 'brain',
        points: 50,
        questions: [
          {
            id: 'q1',
            question: 'Как вы предпочитаете проводить свободное время?',
            options: [
              'Читать книгу',
              'Гулять с друзьями',
              'Смотреть фильмы',
              'Заниматься спортом',
            ],
            correctAnswer: 0,
          },
          {
            id: 'q2',
            question: 'Что лучше всего вас описывает?',
            options: [
              'Интроверт и вдумчивый',
              'Экстраверт и энергичный',
              'Творческий и артистичный',
              'Аналитический и логичный',
            ],
            correctAnswer: 1,
          },
          {
            id: 'q3',
            question: 'Ваш идеальный отпуск:',
            options: [
              'Тихий пляжный курорт',
              'Приключение в горах',
              'Исследование нового города',
              'Остаться дома и отдохнуть',
            ],
            correctAnswer: 2,
          },
          {
            id: 'q4',
            question: 'Как вы справляетесь со стрессом?',
            options: [
              'Разговариваю с друзьями',
              'Занимаюсь спортом',
              'Медитирую или провожу время в тишине',
              'Работаю над проблемой',
            ],
            correctAnswer: 0,
          },
          {
            id: 'q5',
            question: 'Что вас больше всего мотивирует?',
            options: [
              'Помощь другим',
              'Достижение целей',
              'Изучение нового',
              'Веселье',
            ],
            correctAnswer: 2,
          },
        ],
      },
      {
        id: 'quiz-2',
        title: 'Общая Эрудиция',
        description: 'Проверьте свои общие знания',
        icon: 'trophy',
        points: 75,
        questions: [
          {
            id: 'q1',
            question: 'Какая столица Франции?',
            options: ['Лондон', 'Берлин', 'Париж', 'Мадрид'],
            correctAnswer: 2,
          },
          {
            id: 'q2',
            question: 'Какая планета известна как Красная планета?',
            options: ['Венера', 'Марс', 'Юпитер', 'Сатурн'],
            correctAnswer: 1,
          },
          {
            id: 'q3',
            question: 'Кто написал Мону Лизу?',
            options: [
              'Винсент ван Гог',
              'Пабло Пикассо',
              'Леонардо да Винчи',
              'Микеланджело',
            ],
            correctAnswer: 2,
          },
          {
            id: 'q4',
            question: 'Какой самый большой океан на Земле?',
            options: [
              'Атлантический океан',
              'Индийский океан',
              'Северный Ледовитый океан',
              'Тихий океан',
            ],
            correctAnswer: 3,
          },
          {
            id: 'q5',
            question: 'В каком году закончилась Вторая мировая война?',
            options: ['1943', '1944', '1945', '1946'],
            correctAnswer: 2,
          },
        ],
      },
      {
        id: 'quiz-3',
        title: 'Праздничные Традиции',
        description: 'Насколько хорошо вы знаете праздничные обычаи?',
        icon: 'gift',
        points: 60,
        questions: [
          {
            id: 'q1',
            question: 'Какая страна начала традицию ставить рождественскую ёлку?',
            options: ['США', 'Германия', 'Англия', 'Франция'],
            correctAnswer: 1,
          },
          {
            id: 'q2',
            question: 'Что традиционно ставят на верхушку рождественской ёлки?',
            options: ['Звезду', 'Колокольчик', 'Снежинку', 'Венок'],
            correctAnswer: 0,
          },
          {
            id: 'q3',
            question: 'В какой стране традиционно едят KFC на Рождество?',
            options: ['Китай', 'Япония', 'Корея', 'Таиланд'],
            correctAnswer: 1,
          },
          {
            id: 'q4',
            question: 'Как зовут оленя с красным носом?',
            options: ['Дэшер', 'Рудольф', 'Блитцен', 'Комет'],
            correctAnswer: 1,
          },
          {
            id: 'q5',
            question: 'Сколько всего подарков дарят в песне "Двенадцать дней Рождества"?',
            options: ['144', '78', '364', '156'],
            correctAnswer: 2,
          },
        ],
      },
    ],
  };

  return quizzes[lang];
}
