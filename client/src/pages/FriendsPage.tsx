import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '../components/SectionTitle';
import { UserIcon, GiftIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { trpc } from '../lib/trpc';

export default function FriendsPage() {
  const { t, language } = useLanguage();
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);

  // Queries
  const { data: friends, isLoading, refetch } = trpc.events.myFriends.useQuery();
  const { data: friendWishlist } = trpc.wishlist.getPublicWishlist.useQuery(
    { userId: selectedFriendId! },
    { enabled: !!selectedFriendId }
  );

  // Mutation for removing friend
  const removeFriend = trpc.events.removeFriend.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedFriendId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="pb-20 px-4 pt-6">
      <SectionTitle>
        <div className="flex items-center gap-2">
          <UserIcon size={28} />
          {language === 'ru' ? 'Друзья' : 'Friends'}
        </div>
      </SectionTitle>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-6">
      <SectionTitle>
        <div className="flex items-center gap-2">
          <UserIcon size={28} />
          {language === 'ru' ? 'Друзья' : 'Friends'}
        </div>
      </SectionTitle>

      {/* Friends List */}
      {(!friends || friends.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <UserIcon size={64} className="mx-auto mb-4 opacity-30" />
          <p>{language === 'ru' ? 'У вас пока нет друзей' : 'No friends yet'}</p>
          <p className="text-sm mt-2">
            {language === 'ru' 
              ? 'Друзья добавляются автоматически когда вы присоединяетесь к событиям по invite ссылке' 
              : 'Friends are added automatically when you join events via invite links'}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {friends?.map((friend, index) => {
          const isSelected = selectedFriendId === friend.id;

          return (
            <Card
              key={friend.id}
              className={`p-4 cursor-pointer transition-all stagger-item ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedFriendId(isSelected ? null : friend.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {friend.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-bold">{friend.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ru' ? 'Друг' : 'Friend'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(language === 'ru' ? 'Удалить из друзей?' : 'Remove friend?')) {
                      removeFriend.mutate({ friendId: friend.id });
                    }
                  }}
                >
                  {language === 'ru' ? 'Удалить' : 'Remove'}
                </Button>
              </div>

              {/* Friend's Wishlist */}
              {isSelected && (
                <div className="mt-4 space-y-3 animate-slide-up">
                  <h4 className="font-semibold flex items-center gap-2">
                    <GiftIcon size={18} />
                    {language === 'ru' ? 'Список желаний' : 'Wishlist'}
                  </h4>

                  {friendWishlist && friendWishlist.length > 0 && (
                    <div className="space-y-2">
                      {friendWishlist.map((item) => (
                        <div key={item.id} className="bg-secondary/50 p-3 rounded-lg">
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
                  )}

                  {friendWishlist && friendWishlist.length === 0 && (
                    <div className="bg-secondary/50 p-4 rounded-lg text-center text-muted-foreground">
                      <p className="text-sm">
                        {language === 'ru' 
                          ? 'Список желаний пуст' 
                          : 'Wishlist is empty'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
