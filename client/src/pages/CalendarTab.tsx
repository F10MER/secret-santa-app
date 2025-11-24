import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '../components/SectionTitle';
import { useLanguage } from '../contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  type: 'deadline' | 'santa_event';
  description?: string;
}

export default function CalendarTab() {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch reservations and events
  const { data: reservations = [] } = trpc.wishlist.getMyReservations.useQuery();
  const { data: events = [] } = trpc.santa.getMyEvents.useQuery();

  // Build calendar events from reservations and Santa events
  const calendarEvents: CalendarEvent[] = [
    ...reservations
      .filter((r: any) => r.deadline)
      .map((r: any) => ({
        id: r.id,
        title: `${t.calendar.giftFor || 'Gift for'} ${r.ownerName}`,
        date: new Date(r.deadline),
        type: 'deadline' as const,
        description: r.itemTitle,
      })),
    ...events.map((e: any) => ({
      id: e.id,
      title: e.name,
      date: new Date(e.eventDate),
      type: 'santa_event' as const,
      description: `${e.minBudget}-${e.maxBudget} ${t.calendar.currency || '$'}`,
    })),
  ];

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter((event) => isSameDay(new Date(event.date), date));
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }

  const monthNames = t.calendar.months || [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = t.calendar.dayNames || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="pb-20 px-4 pt-6 animate-fade-in">
      {/* Header */}
      <SectionTitle>{t.calendar.title || 'Calendar'}</SectionTitle>

      {/* Month Navigation */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            ←
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            →
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={goToToday} className="w-full mb-4">
          {t.calendar.today || 'Today'}
        </Button>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day names */}
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayEvents = getEventsForDate(date);
            const isToday = isSameDay(date, today);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const hasDeadline = dayEvents.some((e) => e.type === 'deadline');
            const hasEvent = dayEvents.some((e) => e.type === 'santa_event');

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-md text-sm
                  transition-colors relative
                  ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                  ${isSelected ? 'ring-2 ring-primary' : ''}
                  ${!isToday && !isSelected ? 'hover:bg-muted' : ''}
                `}
              >
                <span>{date.getDate()}</span>
                {(hasDeadline || hasEvent) && (
                  <div className="flex gap-0.5 mt-0.5">
                    {hasDeadline && (
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    )}
                    {hasEvent && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4 mb-4">
        <h3 className="font-semibold mb-3 text-sm">{t.calendar.legend || 'Legend'}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>{t.calendar.deadlines || 'Gift Deadlines'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>{t.calendar.events || 'Secret Santa Events'}</span>
          </div>
        </div>
      </Card>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card className="p-4 animate-slide-up">
          <h3 className="font-semibold mb-3">
            {selectedDate.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>

          {selectedDateEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.calendar.noEvents || 'No events on this date'}</p>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => (
                <div
                  key={`${event.type}-${event.id}`}
                  className={`p-3 rounded-md ${
                    event.type === 'deadline'
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                      {event.description && (
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        event.type === 'deadline'
                          ? 'bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300'
                          : 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {event.type === 'deadline' ? t.calendar.deadline : t.calendar.event}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Summary */}
      <Card className="p-4 mt-4">
        <h3 className="font-semibold mb-3 text-sm">{t.calendar.summary || 'Summary'}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.calendar.totalDeadlines || 'Total Deadlines'}:</span>
            <span className="font-semibold">
              {calendarEvents.filter((e) => e.type === 'deadline').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.calendar.totalEvents || 'Total Events'}:</span>
            <span className="font-semibold">
              {calendarEvents.filter((e) => e.type === 'santa_event').length}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
