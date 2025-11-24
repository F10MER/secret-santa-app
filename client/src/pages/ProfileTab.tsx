import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '../components/SectionTitle';
import {
  UserIcon,
  TrophyIcon,
  CameraIcon,
  LockIcon,
  ShareIcon,
  PlusIcon,
} from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { MOCK_USER, MOCK_LEADERBOARD } from '../constants';
import { WishlistItem } from '../types';
import { toast } from 'sonner';

export default function ProfileTab() {
  const { t, language, setLanguage } = useLanguage();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [wishlistPrivacy, setWishlistPrivacy] = useState<'all' | 'friends'>('all');
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddWishlistItem = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const description = prompt(t.profile.addItem + ' - Enter description:');
      if (!description) return;

      const newItem: WishlistItem = {
        id: `wish-${Date.now()}`,
        image: event.target?.result as string,
        description,
        createdAt: new Date().toISOString(),
      };

      setWishlistItems([...wishlistItems, newItem]);
    };
    reader.readAsDataURL(file);
  };

  const handleShareReferral = () => {
    const referralLink = `https://t.me/SecretSantaBot?start=${MOCK_USER.id}`;
    navigator.clipboard.writeText(referralLink);
    toast.success(t.profile.linkCopied);
  };

  const handleShareWishlist = () => {
    const wishlistLink = `${window.location.origin}/wishlist/${MOCK_USER.id}?name=${encodeURIComponent(MOCK_USER.name)}`;
    navigator.clipboard.writeText(wishlistLink);
    toast.success(t.profile.wishlistLinkCopied);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Leaderboard Modal
  if (showLeaderboard) {
    return (
      <div className="pb-20 px-4 pt-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle className="mb-0">{t.profile.leaderboard}</SectionTitle>
          <Button variant="outline" onClick={() => setShowLeaderboard(false)} size="sm">
            {t.profile.close}
          </Button>
        </div>

        <div className="space-y-2">
          {MOCK_LEADERBOARD.map((entry, index) => (
            <Card
              key={entry.id}
              className={`p-4 stagger-item ${
                entry.id === MOCK_USER.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold w-8 text-center">
                  {entry.rank <= 3 ? (
                    <span>
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{entry.rank}</span>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {getInitials(entry.name)}
                </div>
                <div className="flex-1">
                  <p className="font-bold">
                    {entry.name}
                    {entry.id === MOCK_USER.id && (
                      <span className="ml-2 text-xs text-primary">({t.profile.you})</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{entry.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{entry.points}</p>
                  <p className="text-xs text-muted-foreground">{t.profile.points}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Main Profile View
  return (
    <div className="pb-20 px-4 pt-6 animate-fade-in">
      {/* User Header */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {getInitials(MOCK_USER.name)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{MOCK_USER.name}</h2>
            <p className="text-white/90 mb-3">{MOCK_USER.level}</p>
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-white/80">{t.profile.referrals}</p>
                <p className="text-xl font-bold">{MOCK_USER.referrals}</p>
              </div>
              <div>
                <p className="text-sm text-white/80">{t.profile.points}</p>
                <p className="text-xl font-bold">{MOCK_USER.points}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Leaderboard Button */}
      <Button
        onClick={() => setShowLeaderboard(true)}
        className="w-full mb-6 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900"
      >
        <TrophyIcon size={20} className="mr-2" />
        {t.profile.leaderboard}
      </Button>

      {/* Wishlist Section */}
      <SectionTitle>{t.profile.wishlist}</SectionTitle>
      
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <LockIcon size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground">{t.profile.privacy}:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setWishlistPrivacy('all')}
              className={`px-3 py-1 rounded ${
                wishlistPrivacy === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {t.profile.all}
            </button>
            <button
              onClick={() => setWishlistPrivacy('friends')}
              className={`px-3 py-1 rounded ${
                wishlistPrivacy === 'friends'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {t.profile.friendsOnly}
            </button>
          </div>
        </div>
      </div>

      <Button
        onClick={handleAddWishlistItem}
        variant="outline"
        className="w-full mb-4"
      >
        <PlusIcon size={20} className="mr-2" />
        {t.profile.addItem}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {wishlistItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CameraIcon size={48} className="mx-auto mb-3 opacity-30" />
          <p>{t.profile.noWishlist}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {wishlistItems.map((item, index) => (
            <Card
              key={item.id}
              className="overflow-hidden stagger-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={item.image}
                alt={item.description}
                className="w-full h-32 object-cover"
              />
              <div className="p-2">
                <p className="text-sm font-medium line-clamp-2">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Settings Section */}
      <SectionTitle>{t.profile.settings}</SectionTitle>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">{t.profile.language}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ru')}
              className={`px-4 py-2 rounded ${
                language === 'ru'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              RU
            </button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <Button
          onClick={handleShareWishlist}
          variant="outline"
          className="w-full"
        >
          <ShareIcon size={20} className="mr-2" />
          {t.profile.shareWishlist}
        </Button>
        
        <Button
          onClick={handleShareReferral}
          variant="outline"
          className="w-full"
        >
          <ShareIcon size={20} className="mr-2" />
          {t.profile.shareReferral}
        </Button>
      </div>
    </div>
  );
}
