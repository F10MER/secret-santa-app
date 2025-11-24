import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '../components/SectionTitle';
import { GiftIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface MyReservationsProps {
  onBack: () => void;
}

export default function MyReservations({ onBack }: MyReservationsProps) {
  const { t } = useLanguage();

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

  const handleCancelReservation = (wishlistItemId: number) => {
    if (confirm(t.reservations.confirmCancel || 'Are you sure you want to cancel this reservation?')) {
      unreserveMutation.mutate({ wishlistItemId });
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
            {t.reservations.description || `You have reserved ${reservations.length} gift${reservations.length > 1 ? 's' : ''} for your friends`}
          </p>
          
          {reservations.map((reservation: any, index: number) => (
            <Card
              key={reservation.id}
              className="overflow-hidden stagger-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex gap-4 p-4">
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

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span>{t.reservations.for || 'For'}:</span>
                    <span className="font-medium text-foreground">
                      {reservation.ownerName || t.reservations.unknown || 'Unknown'}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelReservation(reservation.wishlistItemId)}
                    disabled={unreserveMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {unreserveMutation.isPending ? t.common.loading : t.wishlist.cancelReservation}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
