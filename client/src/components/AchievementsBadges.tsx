import { Card } from '@/components/ui/card';
import { TrophyIcon, GiftIcon, UserIcon, StarIcon } from './Icons';
import { trpc } from '@/lib/trpc';

const achievementConfig = {
  first_event: {
    icon: GiftIcon,
    title: 'First Event',
    description: 'Created your first Secret Santa event',
    color: 'from-blue-500 to-cyan-500',
  },
  five_events: {
    icon: TrophyIcon,
    title: 'Event Master',
    description: 'Created 5 Secret Santa events',
    color: 'from-purple-500 to-pink-500',
  },
  ten_events: {
    icon: TrophyIcon,
    title: 'Event Legend',
    description: 'Created 10 Secret Santa events',
    color: 'from-yellow-500 to-orange-500',
  },
  first_gift: {
    icon: GiftIcon,
    title: 'First Gift',
    description: 'Participated in your first Secret Santa',
    color: 'from-green-500 to-emerald-500',
  },
  five_gifts: {
    icon: UserIcon,
    title: 'Social Butterfly',
    description: 'Made 5 friends through Secret Santa',
    color: 'from-pink-500 to-rose-500',
  },
  ten_gifts: {
    icon: StarIcon,
    title: 'Gift Master',
    description: 'Exchanged 10 gifts',
    color: 'from-indigo-500 to-purple-500',
  },
  active_user: {
    icon: StarIcon,
    title: 'Active User',
    description: 'Logged in for 7 consecutive days',
    color: 'from-amber-500 to-yellow-500',
  },
  social_butterfly: {
    icon: UserIcon,
    title: 'Super Social',
    description: 'Made 10 friends',
    color: 'from-red-500 to-pink-500',
  },
};

export function AchievementsBadges() {
  const { data: achievements = [] } = trpc.achievements.getMyAchievements.useQuery();
  
  const unlockedTypes = new Set(achievements.map(a => a.achievementType));
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">🏆 Achievements</h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(achievementConfig).map(([type, config]) => {
          const isUnlocked = unlockedTypes.has(type as any);
          const Icon = config.icon;
          
          return (
            <Card
              key={type}
              className={`p-4 transition-all ${
                isUnlocked
                  ? `bg-gradient-to-br ${config.color} text-white shadow-lg`
                  : 'bg-muted/50 opacity-50 grayscale'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-full ${isUnlocked ? 'bg-white/20' : 'bg-muted'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{config.title}</p>
                  <p className={`text-xs ${isUnlocked ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {config.description}
                  </p>
                </div>
                {isUnlocked && (
                  <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    Unlocked ✓
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
