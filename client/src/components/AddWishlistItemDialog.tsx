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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = {
    en: {
      title: 'Add Wishlist Item',
      description: 'Description',
      descriptionPlaceholder: 'What do you want?',
      productLink: 'Product Link (optional)',
      productLinkPlaceholder: 'https://...',
      imageUpload: 'Upload Image (optional)',
      imageUploadHint: 'Max 3MB',
      imageTooLarge: 'Image must be less than 3MB',
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
      imageUpload: 'Загрузить изображение (необязательно)',
      imageUploadHint: 'Макс 3МБ',
      imageTooLarge: 'Изображение должно быть меньше 3МБ',
      cancel: 'Отмена',
      add: 'Добавить',
      descriptionRequired: 'Описание обязательно',
    },
  }[language];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (3MB = 3 * 1024 * 1024 bytes)
    if (file.size > 3 * 1024 * 1024) {
      toast.error(t.imageTooLarge);
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error(t.descriptionRequired);
      return;
    }

    setLoading(true);
    
    let imageUrl: string | undefined;
    
    // Upload image to S3 if file is selected
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        const data = await response.json();
        imageUrl = data.url;
      } catch (error) {
        toast.error(language === 'ru' ? 'Ошибка загрузки изображения' : 'Failed to upload image');
        setLoading(false);
        return;
      }
    }

    onAdd({
      title: description.split('\n')[0] || description.substring(0, 50), // First line or first 50 chars as title
      description: description.trim(),
      productLink: productLink.trim() || undefined,
      imageUrl,
    });

    // Reset form
    setDescription('');
    setProductLink('');
    setImageFile(null);
    setImagePreview(null);
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
            <Label htmlFor="imageFile">{t.imageUpload}</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="text-xs text-muted-foreground">{t.imageUploadHint}</p>
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
              </div>
            )}
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
