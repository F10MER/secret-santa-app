import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GiftIcon, LockIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTelegram } from '../contexts/TelegramContext';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface PublicWishlistProps {
  userId: number;
}

export default function PublicWishlist({ userId }: PublicWishlistProps) {
  const { t } = useLanguage();
  const { user: tgUser } = useTelegram();
  const [userName, setUserName] = useState('');

  // Fetch public wishlist
  const { data: wishlist = [], isLoading, error, refetch } = trpc.wishlist.getPublicWishlist.useQuery({ userId });
  
  // Mutations
  const reserveMutation = trpc.wishlist.reserveGift.useMutation({
    onSuccess: () => {
      toast.success(t.wishlist.reserved || 'Gift reserved successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const unreserveMutation = trpc.wishlist.unreserveGift.useMutation({
    onSuccess: () => {
      toast.success(t.wishlist.unreserved || 'Reservation cancelled');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    // Extract user name from URL or use default
    const params = new URLSearchParams(window.location.search);
    setUserName(params.get('name') || t.wishlist.user);
  }, [t]);

  const handleReserve = (itemId: number) => {
    if (!tgUser) {
      toast.error(t.wishlist.loginRequired || 'Please login to reserve gifts');
      return;
    }
    reserveMutation.mutate({ wishlistItemId: itemId });
  };

  const handleUnreserve = (itemId: number) => {
    unreserveMutation.mutate({ wishlistItemId: itemId });
  };

  // Check if current user is the wishlist owner
  const isOwner = tgUser?.id === userId;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.wishlist.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-destructive mb-4">{t.wishlist.error}</p>
          <Button onClick={() => window.location.href = '/'}>{t.wishlist.goHome}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 pt-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {userName.substring(0, 2).toUpperCase()}
        </div>
        <h1 className="text-3xl font-bold mb-2">{userName}</h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <GiftIcon size={20} />
          {t.wishlist.title}
        </p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
          <LockIcon size={16} />
          {t.wishlist.public}
        </div>
      </div>

      {/* Wishlist Items */}
      {wishlist.length === 0 ? (
        <Card className="p-12 text-center">
          <GiftIcon size={64} className="mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-semibold mb-2">{t.wishlist.empty}</h3>
          <p className="text-muted-foreground mb-6">{t.wishlist.emptyDesc}</p>
          
          {!isOwner && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="font-medium mb-3">{t.wishlist.createYourOwn}</p>
              <Button onClick={() => window.open('https://t.me/moisanta_bot', '_blank')}>
                {t.wishlist.startBot}
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {wishlist.map((item: any, index: number) => {
            // For demo purposes, we'll use a simple check
            // In real implementation, you'd fetch reservation status from API
            const isReserved = false; // TODO: Implement actual reservation check
            const isReservedByMe = false; // TODO: Check if current user reserved this

            return (
              <Card
                key={item.id}
                className="overflow-hidden stagger-item relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Reservation UI - Only visible to non-owners */}
                  {!isOwner && (
                    <div className="mt-4">
                      {isReservedByMe ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleUnreserve(item.id)}
                          disabled={unreserveMutation.isPending}
                        >
                          {unreserveMutation.isPending ? t.common.loading : (t.wishlist.cancelReservation || 'Cancel Reservation')}
                        </Button>
                      ) : isReserved ? (
                        <div className="text-center py-2 px-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-md text-sm">
                          {t.wishlist.alreadyReserved || 'Already reserved by someone'}
                        </div>
                      ) : (
                        <Button
                          variant="default"
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                          onClick={() => handleReserve(item.id)}
                          disabled={reserveMutation.isPending}
                        >
                          <GiftIcon size={18} className="mr-2" />
                          {reserveMutation.isPending ? t.common.loading : (t.wishlist.reserveGift || 'Reserve This Gift')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
