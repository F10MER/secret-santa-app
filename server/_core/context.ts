import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // First try Telegram WebApp authentication
    const telegramInitData = opts.req.headers['x-telegram-init-data'] as string;
    
    if (telegramInitData) {
      // Parse Telegram initData
      const params = new URLSearchParams(telegramInitData);
      const userDataStr = params.get('user');
      
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const telegramId = userData.id;
        
        if (telegramId) {
          // Get or create user by Telegram ID
          user = await import('../db').then(db => db.getUserByTelegramId(telegramId)) || null;
          
          if (!user) {
            console.log(`[Context] User not found for Telegram ID ${telegramId}, creating...`);
            const newUserId = await import('../db').then(db => db.createUser({
              telegramId,
              name: userData.first_name || userData.username || `User${telegramId}`,
              loginMethod: 'telegram',
            }));
            
            if (newUserId) {
              user = await import('../db').then(db => db.getUserByTelegramId(telegramId)) || null;
            }
          }
        }
      }
    }
    
    // Fallback to regular OAuth authentication if no Telegram data
    if (!user) {
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
