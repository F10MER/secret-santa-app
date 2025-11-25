import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionTitle } from '../components/SectionTitle';
import { GiftIcon, PlusIcon, CheckIcon, ShareIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { SantaEvent, Participant } from '../types';
import { MOCK_PARTICIPANT_NAMES } from '../constants';

export default function SecretSantaTab() {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<SantaEvent[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    minBudget: '',
    maxBudget: '',
    date: '',
  });

  const handleCreateEvent = () => {
    if (!formData.name || !formData.minBudget || !formData.maxBudget || !formData.date) {
      return;
    }

    const newEvent: SantaEvent = {
      id: `event-${Date.now()}`,
      name: formData.name,
      minBudget: parseFloat(formData.minBudget),
      maxBudget: parseFloat(formData.maxBudget),
      date: formData.date,
      status: 'Created',
      participants: [],
    };

    setEvents([...events, newEvent]);
    setFormData({ name: '', minBudget: '', maxBudget: '', date: '' });
    setShowCreateForm(false);
    setSelectedEvent(newEvent.id);
  };

  const handleAddParticipant = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const usedNames = event.participants.map((p) => p.name);
    const availableNames = MOCK_PARTICIPANT_NAMES.filter((name) => !usedNames.includes(name));
    
    if (availableNames.length === 0) {
      alert('No more mock participants available!');
      return;
    }

    const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
    const newParticipant: Participant = {
      id: `participant-${Date.now()}`,
      name: randomName,
    };

    setEvents(
      events.map((e) =>
        e.id === eventId
          ? { ...e, participants: [...e.participants, newParticipant] }
          : e
      )
    );
  };

  const handleDrawNames = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event || event.participants.length < 2) {
      alert('Need at least 2 participants to draw names!');
      return;
    }

    // Fisher-Yates shuffle algorithm
    const participants = [...event.participants];
    const shuffled = [...participants];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Create assignments ensuring no one gets themselves
    const assignments: Record<string, string> = {};
    let valid = true;
    
    for (let i = 0; i < participants.length; i++) {
      const giver = participants[i];
      const receiver = shuffled[i];
      
      if (giver.id === receiver.id) {
        valid = false;
        break;
      }
      
      assignments[giver.id] = receiver.id;
    }

    // If invalid, try again (recursive approach for simplicity)
    if (!valid) {
      handleDrawNames(eventId);
      return;
    }

    setEvents(
      events.map((e) =>
        e.id === eventId
          ? { ...e, status: 'Assigned', assignments }
          : e
      )
    );
  };

  const getMyRecipient = (event: SantaEvent): string | null => {
    if (!event.assignments) return null;
    
    // For demo purposes, assume the first participant is "me"
    const myId = event.participants[0]?.id;
    if (!myId) return null;
    
    const recipientId = event.assignments[myId];
    const recipient = event.participants.find((p) => p.id === recipientId);
    
    return recipient?.name || null;
  };

  return (
    <div className="pb-20 px-4 pt-6 animate-fade-in">
      <SectionTitle>{t.santa.title}</SectionTitle>

      {/* Create Button */}
      {!showCreateForm && (
        <Button
          onClick={() => setShowCreateForm(true)}
          className="mb-6 w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
        >
          <PlusIcon size={20} className="mr-2" />
          {t.santa.createNew}
        </Button>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card className="p-4 mb-6 animate-slide-up">
          <h3 className="text-lg font-bold mb-4">{t.santa.createNew}</h3>
          <div className="space-y-3">
            <Input
              placeholder={t.santa.eventName}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder={t.santa.minBudget}
                value={formData.minBudget}
                onChange={(e) => setFormData({ ...formData, minBudget: e.target.value })}
              />
              <Input
                type="number"
                placeholder={t.santa.maxBudget}
                value={formData.maxBudget}
                onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
              />
            </div>
            <Input
              type="date"
              placeholder={t.santa.eventDate}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateEvent} className="flex-1">
                {t.santa.createButton}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                {t.common.cancel}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Events List */}
      {events.length === 0 && !showCreateForm && (
        <div className="text-center py-12 text-muted-foreground">
          <GiftIcon size={64} className="mx-auto mb-4 opacity-30" />
          <p>{t.santa.noEvents}</p>
        </div>
      )}

      <div className="space-y-4">
        {events.map((event, index) => (
          <Card
            key={event.id}
            className={`p-4 cursor-pointer transition-all stagger-item ${
              selectedEvent === event.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedEvent(event.id)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold">{event.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ${event.minBudget} - ${event.maxBudget} • {event.date}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  event.status === 'Assigned'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                }`}
              >
                {event.status === 'Assigned' ? t.santa.assigned : t.santa.created}
              </span>
            </div>

            {/* Participants */}
            <div className="mb-3">
              <p className="text-sm font-semibold mb-2">
                {t.santa.participants}: {event.participants.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {event.participants.map((p) => (
                  <span
                    key={p.id}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            {selectedEvent === event.id && (
              <div className="space-y-2 animate-slide-up">
                {event.status === 'Created' && (
                  <>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        const inviteLink = `https://t.me/moisanta_bot?start=event_${event.id}`;
                        navigator.clipboard.writeText(inviteLink);
                        alert(language === 'ru' ? 'Ссылка-приглашение скопирована!' : 'Invite link copied!');
                      }}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <ShareIcon size={16} className="mr-2" />
                      {language === 'ru' ? 'Пригласить участников' : 'Invite Participants'}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddParticipant(event.id);
                      }}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <PlusIcon size={16} className="mr-2" />
                      {t.santa.addParticipant}
                    </Button>
                    {event.participants.length >= 2 && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDrawNames(event.id);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckIcon size={16} className="mr-2" />
                        {t.santa.drawNames}
                      </Button>
                    )}
                  </>
                )}

                {/* Show recipient if assigned */}
                {event.status === 'Assigned' && getMyRecipient(event) && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg text-center animate-scale-in">
                    <p className="text-sm mb-1">{t.santa.yourRecipient}</p>
                    <p className="text-2xl font-bold">{getMyRecipient(event)}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
