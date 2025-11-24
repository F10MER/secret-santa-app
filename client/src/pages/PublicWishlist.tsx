import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GiftIcon, LockIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface PublicWishlistProps {
  userId: number;
}

export default function PublicWishlist({ userId }: PublicWishlistProps) {
  const { t } = useLanguage();
  const [userName, setUserName] = useState('');

  // Fetch public wishlist
  const { data: wishlist = [], isLoading, error } = trpc.wishlist.getPublicWishlist.useQuery({ userId });

  useEffect(() => {
    // Extract user name from URL or use default
    const params = new URLSearchParams(window.location.search);
    setUserName(params.get('name') || t.wishlist.user);
  }, [t]);

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
      </div>

      {/* Wishlist Items */}
      {wishlist.length === 0 ? (
        <Card className="p-12 text-center">
          <GiftIcon size={64} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl font-semibold mb-2">{t.wishlist.empty}</p>
          <p className="text-muted-foreground">{t.wishlist.emptyDesc}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {wishlist.map((item, index) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition-shadow stagger-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {item.imageUrl && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LockIcon size={14} />
                  <span>{t.wishlist.public}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground mb-4">{t.wishlist.createYourOwn}</p>
        <Button
          onClick={() => window.open('https://t.me/moisanta_bot', '_blank')}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
        >
          <GiftIcon className="mr-2" size={20} />
          {t.wishlist.startBot}
        </Button>
      </div>
    </div>
  );
}
