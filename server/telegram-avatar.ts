import { Request, Response } from 'express';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Cache for avatar URLs (in-memory, could be Redis in production)
const avatarCache = new Map<number, { url: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function getTelegramAvatar(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    // Check cache
    const cached = avatarCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({ avatarUrl: cached.url });
    }

    // Fetch user profile photos from Telegram API
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUserProfilePhotos?user_id=${userId}&limit=1`
    );

    if (!response.ok) {
      return res.status(404).json({ error: 'User not found' });
    }

    const data = await response.json() as any;

    if (!data.result || !data.result.photos || data.result.photos.length === 0) {
      return res.status(404).json({ error: 'No profile photo' });
    }

    // Get the largest photo size
    const photo = data.result.photos[0];
    const largestPhoto = photo[photo.length - 1];
    const fileId = largestPhoto.file_id;

    // Get file path
    const fileResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
    );

    if (!fileResponse.ok) {
      return res.status(500).json({ error: 'Failed to get file' });
    }

    const fileData = await fileResponse.json() as any;
    const filePath = fileData.result.file_path;

    // Construct avatar URL
    const avatarUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;

    // Cache the result
    avatarCache.set(userId, { url: avatarUrl, timestamp: Date.now() });

    res.json({ avatarUrl });
  } catch (error) {
    console.error('Error fetching Telegram avatar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
