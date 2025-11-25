import { createHmac } from 'crypto';
import jwt from 'jsonwebtoken';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

/**
 * Validate Telegram WebApp initData
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramWebAppData(initData: string): TelegramUser | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    if (!hash) {
      return null;
    }

    // Create data-check-string
    const dataCheckArr: string[] = [];
    urlParams.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // Calculate secret key
    const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();

    // Calculate hash
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Verify hash
    if (calculatedHash !== hash) {
      console.error('Invalid hash');
      return null;
    }

    // Check auth_date (data should not be older than 24 hours)
    const authDate = parseInt(urlParams.get('auth_date') || '0');
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authDate > 86400) {
      console.error('Data is too old');
      return null;
    }

    // Parse user data
    const userJson = urlParams.get('user');
    if (!userJson) {
      return null;
    }

    const user: TelegramUser = JSON.parse(userJson);
    return user;
  } catch (error) {
    console.error('Telegram auth validation error:', error);
    return null;
  }
}

/**
 * Generate JWT token for authenticated user
 */
export function generateAuthToken(user: TelegramUser): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Verify JWT token
 */
export function verifyAuthToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
