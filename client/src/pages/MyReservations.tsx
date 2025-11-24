import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionTitle } from '../components/SectionTitle';
import { GiftIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useState } from 'react';

interface MyReservationsProps {
  onBack: () => void;
}

export default function MyReservations({ onBack }: MyReservationsProps) {
  const { t } = useLanguage();
  const [editingDeadline, setEditingDeadline] = useState<number | null>(null);

  // Fetch user's reservations
  const { data: reservations = [], isLoading, refetch } = trpc.wishlist.getMyReservations.useQuery();

  // Unreserve mutation
  const unreserveMutation = trpc.wishlist.unreserveGift.useMutation({
    onSuccess: () => {
      toast.success(t.wishlist.unreserved);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update deadline mutation
  const updateDeadlineMutation = trpc.wishlist.updateDeadline.useMutation({
    onSuccess: () => {
      toast.success(t.reservations.deadlineUpdated || 'Deadline updated');
      setEditingDeadline(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCancelReservation = (wishlistItemId: number) => {
    if (confirm(t.reservations.confirmCancel || 'Are you sure you want to cancel this reservation?')) {
      unreserveMutation.mutate({ wishlistItemId });
    }
  };

  const handleUpdateDeadline = (wishlistItemId: number, deadlineStr: string) => {
    const deadline = deadlineStr ? new Date(deadlineStr) : null;
    updateDeadlineMutation.mutate({ wishlistItemId, deadline });
  };

  const getUrgencyInfo = (deadline: Date | null) => {
    if (!deadline) return null;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: t.reservations.overdue || 'Overdue',
        className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      };
    } else if (diffDays === 0) {
      return {
        label: t.reservations.today || 'Today',
        className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      };
    } else if (diffDays <= 3) {
      return {
        label: t.reservations.soon || `${diffDays} days`,
        className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      };
    } else if (diffDays <= 7) {
      return {
        label: `${diffDays} ${t.reservations.days || 'days'}`,
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      };
    } else {
      return {
        label: `${diffDays} ${t.reservations.days || 'days'}`,
        className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      };
    }
  };

  if (isLoading) {
    return (
      <div className="pb-20 px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle className="mb-0">{t.reservations.title || 'My Reservations'}</SectionTitle>
          <Button variant="outline" onClick={onBack} size="sm">
            {t.profile.close}
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <SectionTitle className="mb-0">{t.reservations.title || 'My Reservations'}</SectionTitle>
        <Button variant="outline" onClick={onBack} size="sm">
          {t.profile.close}
        </Button>
      </div>

      {/* Reservations List */}
      {reservations.length === 0 ? (
        <Card className="p-12 text-center">
          <GiftIcon size={64} className="mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-semibold mb-2">{t.reservations.empty || 'No reservations yet'}</h3>
          <p className="text-muted-foreground">
            {t.reservations.emptyDesc || 'You haven\'t reserved any gifts for your friends yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            {reservations.length} {reservations.length === 1 ? (t.reservations.gift || 'gift') : (t.reservations.gifts || 'gifts')} {t.reservations.reserved || 'reserved'}
          </p>
          
          {reservations.map((reservation: any, index: number) => {
            const urgency = getUrgencyInfo(reservation.deadline);
            const isEditing = editingDeadline === reservation.wishlistItemId;

            return (
              <Card
                key={reservation.id}
                className="overflow-hidden stagger-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-4">
                  <div className="flex gap-4 mb-4">
                    {/* Image */}
                    {reservation.itemImageUrl ? (
                      <img
                        src={reservation.itemImageUrl}
                        alt={reservation.itemTitle || 'Gift'}
                        className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <GiftIcon size={32} className="opacity-30" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {reservation.itemTitle || t.reservations.untitled || 'Untitled'}
                      </h3>
                      
                      {reservation.itemDescription && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {reservation.itemDescription}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{t.reservations.for || 'For'}:</span>
                        <span className="font-medium text-foreground">
                          {reservation.ownerName || t.reservations.unknown || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deadline Section */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{t.reservations.deadline || 'Deadline'}:</span>
                      {urgency && (
                        <span className={`text-xs px-2 py-1 rounded-full ${urgency.className}`}>
                          {urgency.label}
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          defaultValue={reservation.deadline ? new Date(reservation.deadline).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleUpdateDeadline(reservation.wishlistItemId, e.target.value);
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDeadline(null)}
                        >
                          {t.common.cancel}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="flex-1 text-sm text-muted-foreground">
                          {reservation.deadline
                            ? new Date(reservation.deadline).toLocaleDateString()
                            : t.reservations.noDeadline || 'No deadline set'}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDeadline(reservation.wishlistItemId)}
                        >
                          {reservation.deadline ? t.common.edit : (t.reservations.setDeadline || 'Set Deadline')}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelReservation(reservation.wishlistItemId)}
                      disabled={unreserveMutation.isPending}
                      className="w-full"
                    >
                      {unreserveMutation.isPending ? t.common.loading : t.wishlist.cancelReservation}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
