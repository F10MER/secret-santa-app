import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionTitle } from '../components/SectionTitle';
import { GiftIcon, PlusIcon, CheckIcon, ShareIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { trpc } from '../lib/trpc';

interface Event {
  id: number;
  name: string;
  minBudget: number | null;
  maxBudget: number | null;
  eventDate: Date | null;
  status: string;
  inviteCode: string | null;
  creatorId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EventWithParticipants extends Event {
  participants: Array<{
    id: number;
    name: string;
    userId: number | null;
    isMockUser: boolean;
  }>;
}

interface SecretSantaTabProps {
  inviteCode?: string | null;
  onInviteHandled?: () => void;
}

export default function SecretSantaTab({ inviteCode, onInviteHandled }: SecretSantaTabProps = {}) {
  const { t, language } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    minBudget: '',
    maxBudget: '',
    date: '',
  });

  // Queries
  const { data: currentUser } = trpc.auth.me.useQuery();
  const { data: events, isLoading, refetch } = trpc.events.myEvents.useQuery();
  const { data: inviteEventData } = trpc.events.getByInviteCode.useQuery(
    { inviteCode: inviteCode! },
    { enabled: !!inviteCode }
  );
  const { data: selectedEventDetails } = trpc.events.getDetails.useQuery(
    { eventId: selectedEventId! },
    { enabled: !!selectedEventId }
  );
  const { data: myAssignment } = trpc.santa.getMyAssignment.useQuery(
    { eventId: selectedEventId! },
    { enabled: !!selectedEventId }
  );
  const { data: recipientWishlist } = trpc.wishlist.getPublicWishlist.useQuery(
    { userId: myAssignment?.receiver?.userId! },
    { enabled: !!myAssignment?.receiver?.userId }
  );

  // Show invite dialog when invite code is present
  useEffect(() => {
    if (inviteCode && inviteEventData) {
      setShowInviteDialog(true);
    }
  }, [inviteCode, inviteEventData]);

  // Mutations
  const joinEventMutation = trpc.events.joinByInviteCode.useMutation({
    onSuccess: () => {
      refetch();
      setShowInviteDialog(false);
      if (onInviteHandled) onInviteHandled();
      toast.success(language === 'ru' ? 'Вы присоединились к событию!' : 'Joined event!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createEventMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ name: '', minBudget: '', maxBudget: '', date: '' });
      setShowCreateForm(false);
      toast.success(language === 'ru' ? 'Событие создано!' : 'Event created!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const drawNamesMutation = trpc.santa.drawNames.useMutation({
    onSuccess: () => {
      refetch();
      toast.success(language === 'ru' ? 'Имена распределены!' : 'Names drawn!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateEventMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      refetch();
      setShowEditDialog(false);
      setEditingEvent(null);
      setFormData({ name: '', minBudget: '', maxBudget: '', date: '' });
      toast.success(language === 'ru' ? 'Событие обновлено!' : 'Event updated!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteEventMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      refetch();
      setShowDeleteDialog(false);
      setSelectedEventId(null);
      toast.success(language === 'ru' ? 'Событие удалено!' : 'Event deleted!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateEvent = () => {
    if (!formData.name || !formData.minBudget || !formData.maxBudget || !formData.date) {
      toast.error(language === 'ru' ? 'Заполните все поля' : 'Fill all fields');
      return;
    }

    createEventMutation.mutate({
      name: formData.name,
      minBudget: parseFloat(formData.minBudget),
      maxBudget: parseFloat(formData.maxBudget),
      eventDate: formData.date,
    });
  };

  const handleCopyInviteLink = (inviteCode: string) => {
    const botUsername = 'moisanta_bot'; // Your bot username
    const inviteLink = `https://t.me/${botUsername}?start=event_${inviteCode}`;
    
    navigator.clipboard.writeText(inviteLink);
    toast.success(language === 'ru' ? 'Ссылка-приглашение скопирована!' : 'Invite link copied!');
  };

  const handleDrawNames = (eventId: number) => {
    drawNamesMutation.mutate({ eventId });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      minBudget: event.minBudget?.toString() || '',
      maxBudget: event.maxBudget?.toString() || '',
      date: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
    });
    setShowEditDialog(true);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent) return;
    if (!formData.name || !formData.minBudget || !formData.maxBudget || !formData.date) {
      toast.error(language === 'ru' ? 'Заполните все поля' : 'Fill all fields');
      return;
    }

    updateEventMutation.mutate({
      eventId: editingEvent.id,
      name: formData.name,
      minBudget: parseFloat(formData.minBudget),
      maxBudget: parseFloat(formData.maxBudget),
      eventDate: formData.date,
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    setSelectedEventId(eventId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedEventId) {
      deleteEventMutation.mutate({ eventId: selectedEventId });
    }
  };

  if (isLoading) {
    return (
      <div className="pb-20 px-4 pt-6">
        <SectionTitle>{t.santa.title}</SectionTitle>
        <div className="text-center py-12 text-muted-foreground">
          {language === 'ru' ? 'Загрузка...' : 'Loading...'}
        </div>
      </div>
    );
  }

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
              <Button 
                onClick={handleCreateEvent} 
                className="flex-1"
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending 
                  ? (language === 'ru' ? 'Создание...' : 'Creating...') 
                  : t.santa.createButton
                }
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
      {(!events || events.length === 0) && !showCreateForm && (
        <div className="text-center py-12 text-muted-foreground">
          <GiftIcon size={64} className="mx-auto mb-4 opacity-30" />
          <p>{t.santa.noEvents}</p>
        </div>
      )}

      <div className="space-y-4">
        {events?.map((event, index) => {
          const isSelected = selectedEventId === event.id;
          const eventDetails = isSelected ? selectedEventDetails : null;
          const participantCount = eventDetails?.participants.length || 0;
          const isCreator = currentUser && event.creatorId === currentUser.id;

          return (
            <Card
              key={event.id}
              className={`p-4 cursor-pointer transition-all stagger-item ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedEventId(event.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold">{event.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.minBudget && event.maxBudget 
                      ? `$${event.minBudget} - $${event.maxBudget}` 
                      : language === 'ru' ? 'Бюджет не указан' : 'Budget not set'
                    }
                    {event.eventDate && ` • ${new Date(event.eventDate).toLocaleDateString()}`}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    event.status === 'assigned'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}
                >
                  {event.status === 'assigned' ? t.santa.assigned : t.santa.created}
                </span>
              </div>

              {/* Participants */}
              {isSelected && eventDetails && (
                <div className="mb-3">
                  <p className="text-sm font-semibold mb-2">
                    {t.santa.participants}: {participantCount}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {eventDetails.participants.map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {isSelected && (
                <div className="space-y-2 animate-slide-up">
                  {/* Edit/Delete buttons for creator */}
                  {isCreator && event.status === 'created' && (
                    <div className="flex gap-2 mb-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        {language === 'ru' ? '✏️ Редактировать' : '✏️ Edit'}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        {language === 'ru' ? '🗑️ Удалить' : '🗑️ Delete'}
                      </Button>
                    </div>
                  )}

                  {event.status === 'created' && (
                    <>
                      {/* Invite Link */}
                      {event.inviteCode && (
                        <div className="bg-secondary/50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-2">
                            {language === 'ru' ? 'Ссылка-приглашение:' : 'Invite link:'}
                          </p>
                          <div className="flex gap-2">
                            <code className="flex-1 text-xs bg-background px-2 py-1 rounded overflow-x-auto">
                              https://t.me/moisanta_bot?start=event_{event.inviteCode}
                            </code>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyInviteLink(event.inviteCode!);
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <ShareIcon size={16} />
                            </Button>
                          </div>
                        </div>
                      )}

                      {participantCount >= 2 && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDrawNames(event.id);
                          }}
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                          disabled={drawNamesMutation.isPending}
                        >
                          <CheckIcon size={16} className="mr-2" />
                          {t.santa.drawNames}
                        </Button>
                      )}

                      {participantCount < 2 && (
                        <p className="text-xs text-center text-muted-foreground">
                          {language === 'ru' 
                            ? 'Нужно минимум 2 участника для жеребьевки' 
                            : 'Need at least 2 participants to draw names'
                          }
                        </p>
                      )}
                    </>
                  )}

                  {/* Show recipient if assigned */}
                  {event.status === 'assigned' && myAssignment?.receiver && (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg text-center animate-scale-in">
                        <p className="text-sm mb-1">{t.santa.yourRecipient}</p>
                        <p className="text-2xl font-bold">
                          {myAssignment.receiver.name}
                        </p>
                      </div>

                      {/* Recipient's Wishlist */}
                      {recipientWishlist && recipientWishlist.length > 0 && (
                        <div className="bg-secondary/50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-3">
                            {language === 'ru' ? '🎁 Список желаний:' : '🎁 Wishlist:'}
                          </h4>
                          <div className="space-y-2">
                            {recipientWishlist.map((item) => (
                              <div key={item.id} className="bg-background p-3 rounded-lg">
                                <div className="flex gap-3">
                                  {item.imageUrl && (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h5 className="font-medium">{item.title}</h5>
                                    {item.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {recipientWishlist && recipientWishlist.length === 0 && (
                        <div className="bg-secondary/50 p-4 rounded-lg text-center text-muted-foreground">
                          <p className="text-sm">
                            {language === 'ru' 
                              ? 'Список желаний пуст' 
                              : 'Wishlist is empty'}
                          </p>
                        </div>
                      )}

                      {/* Gift Tracking */}
                      <div className="bg-card border border-border p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">
                          {language === 'ru' ? '📦 Статус подарка' : '📦 Gift Status'}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={myAssignment.assignment?.giftStatus === 'pending' ? 'default' : 'outline'}
                              className="flex-1"
                              onClick={() => {
                                // TODO: Update gift status
                              }}
                            >
                              {language === 'ru' ? 'В планах' : 'Pending'}
                            </Button>
                            <Button
                              size="sm"
                              variant={myAssignment.assignment?.giftStatus === 'purchased' ? 'default' : 'outline'}
                              className="flex-1"
                              onClick={() => {
                                // TODO: Update gift status
                              }}
                            >
                              {language === 'ru' ? 'Куплен' : 'Purchased'}
                            </Button>
                            <Button
                              size="sm"
                              variant={myAssignment.assignment?.giftStatus === 'delivered' ? 'default' : 'outline'}
                              className="flex-1"
                              onClick={() => {
                                // TODO: Update gift status
                              }}
                            >
                              {language === 'ru' ? 'Вручен' : 'Delivered'}
                            </Button>
                          </div>
                          {myAssignment.assignment?.giftNote && (
                            <div className="text-sm text-muted-foreground">
                              <strong>{language === 'ru' ? 'Заметка:' : 'Note:'}</strong> {myAssignment.assignment.giftNote}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Invite Dialog */}
      {showInviteDialog && inviteEventData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full animate-scale-in">
            <h3 className="text-xl font-bold mb-4">
              {language === 'ru' ? '🎄 Приглашение на событие' : '🎄 Event Invitation'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'ru' 
                ? `Вас пригласили на событие:` 
                : 'You have been invited to:'}
            </p>
            <div className="bg-secondary/50 p-4 rounded-lg mb-6">
              <h4 className="font-bold text-lg">{inviteEventData.name}</h4>
              {inviteEventData.minBudget && inviteEventData.maxBudget && (
                <p className="text-sm text-muted-foreground">
                  ${inviteEventData.minBudget} - ${inviteEventData.maxBudget}
                </p>
              )}
              {inviteEventData.eventDate && (
                <p className="text-sm text-muted-foreground">
                  {new Date(inviteEventData.eventDate).toLocaleDateString()}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {language === 'ru' ? 'Участников' : 'Participants'}: {inviteEventData.participantCount}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (inviteCode) {
                    joinEventMutation.mutate({ inviteCode });
                  }
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={joinEventMutation.isPending}
              >
                {joinEventMutation.isPending
                  ? (language === 'ru' ? 'Присоединение...' : 'Joining...')
                  : (language === 'ru' ? 'Присоединиться' : 'Join Event')
                }
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowInviteDialog(false);
                  if (onInviteHandled) onInviteHandled();
                }}
                className="flex-1"
              >
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Dialog */}
      {showEditDialog && editingEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full animate-scale-in">
            <h3 className="text-xl font-bold mb-4">
              {language === 'ru' ? '✏️ Редактировать событие' : '✏️ Edit Event'}
            </h3>
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
                <Button
                  onClick={handleUpdateEvent}
                  className="flex-1"
                  disabled={updateEventMutation.isPending}
                >
                  {updateEventMutation.isPending
                    ? (language === 'ru' ? 'Сохранение...' : 'Saving...')
                    : (language === 'ru' ? 'Сохранить' : 'Save')
                  }
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingEvent(null);
                    setFormData({ name: '', minBudget: '', maxBudget: '', date: '' });
                  }}
                  className="flex-1"
                >
                  {language === 'ru' ? 'Отмена' : 'Cancel'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full animate-scale-in">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              {language === 'ru' ? '🗑️ Удалить событие?' : '🗑️ Delete Event?'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'ru'
                ? 'Вы уверены, что хотите удалить это событие? Это действие нельзя отменить.'
                : 'Are you sure you want to delete this event? This action cannot be undone.'}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={deleteEventMutation.isPending}
              >
                {deleteEventMutation.isPending
                  ? (language === 'ru' ? 'Удаление...' : 'Deleting...')
                  : (language === 'ru' ? 'Удалить' : 'Delete')
                }
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
              >
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
