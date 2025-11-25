import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddWishlistItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: {
    title: string;
    description: string;
    productLink?: string;
    imageUrl?: string;
  }) => void;
}

export function AddWishlistItemDialog({ open, onOpenChange, onAdd }: AddWishlistItemDialogProps) {
  const { language } = useLanguage();
  const [description, setDescription] = useState('');
  const [productLink, setProductLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
    en: {
      title: 'Add Wishlist Item',
      description: 'Description',
      descriptionPlaceholder: 'What do you want?',
      productLink: 'Product Link (optional)',
      productLinkPlaceholder: 'https://...',
      imageUrl: 'Image URL (optional)',
      imageUrlPlaceholder: 'https://...',
      cancel: 'Cancel',
      add: 'Add',
      descriptionRequired: 'Description is required',
    },
    ru: {
      title: 'Добавить желание',
      description: 'Описание',
      descriptionPlaceholder: 'Что вы хотите?',
      productLink: 'Ссылка на товар (необязательно)',
      productLinkPlaceholder: 'https://...',
      imageUrl: 'Ссылка на изображение (необязательно)',
      imageUrlPlaceholder: 'https://...',
      cancel: 'Отмена',
      add: 'Добавить',
      descriptionRequired: 'Описание обязательно',
    },
  }[language];

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error(t.descriptionRequired);
      return;
    }

    setLoading(true);
    onAdd({
      title: description.split('\n')[0] || description.substring(0, 50), // First line or first 50 chars as title
      description: description.trim(),
      productLink: productLink.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    });

    // Reset form
    setDescription('');
    setProductLink('');
    setImageUrl('');
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">{t.imageUrl}</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t.imageUrlPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productLink">{t.productLink}</Label>
            <Input
              id="productLink"
              type="url"
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              placeholder={t.productLinkPlaceholder}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {t.add}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
