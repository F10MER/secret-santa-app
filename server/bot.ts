import { Bot, Context, InlineKeyboard, webhookCallback } from "grammy";
import * as db from "./db";

// Bot token will be provided via environment variable
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const WEBHOOK_URL = process.env.WEBHOOK_URL || "";
const APP_URL = process.env.WEBHOOK_URL || "https://moisanta.airatai.com";
const NODE_ENV = process.env.NODE_ENV || "development";

if (!BOT_TOKEN) {
  console.warn("[Bot] TELEGRAM_BOT_TOKEN not set, bot will not start");
}

let bot: Bot | null = null;

export function initBot() {
  if (!BOT_TOKEN) {
    console.warn("[Bot] Skipping bot initialization: no token provided");
    return null;
  }

  bot = new Bot(BOT_TOKEN);

  // Log all incoming updates for debugging
  bot.use(async (ctx, next) => {
    console.log(`[Bot] Received update:`, JSON.stringify(ctx.update, null, 2));
    await next();
  });

  // Command: /start
  bot.command("start", async (ctx) => {
    try {
      const telegramId = ctx.from?.id;
      if (!telegramId) return;

      // Extract deep link parameter (e.g., /start event_ABC123)
      const startPayload = ctx.match;
      console.log(`[Bot] /start command from user ${telegramId}, payload: ${startPayload}`);
      
      // Check if this is an event invite link
      let inviteCode: string | null = null;
      if (startPayload && typeof startPayload === 'string') {
        const match = startPayload.match(/^event_(.+)$/);
        if (match) {
          inviteCode = match[1];
          console.log(`[Bot] Event invite detected: ${inviteCode}`);
        }
      }

      // Build app URL with invite code if present
      let appUrl = APP_URL;
      if (inviteCode) {
        appUrl = `${APP_URL}?inviteCode=${inviteCode}`;
      }
      
      const keyboard = new InlineKeyboard()
        .webApp("🎄 Открыть приложение", appUrl)
        .row()
        .url("📢 Канал с анонсами", "https://t.me/moi_santa");

      // Try to check if user exists, create if not
      let user = null;
      try {
        user = await db.getUserByTelegramId(telegramId);
        
        // Create user if doesn't exist
        if (!user) {
          console.log(`[Bot] Creating new user for Telegram ID: ${telegramId}`);
          const newUserId = await db.createUser({
            telegramId: telegramId,
            name: ctx.from?.first_name || ctx.from?.username || `User${telegramId}`,
            loginMethod: 'telegram',
          });
          
          if (newUserId) {
            user = await db.getUserByTelegramId(telegramId);
            console.log(`[Bot] User created successfully with ID: ${newUserId}`);
          }
        }
      } catch (dbError) {
        console.error(`[Bot] Database error when checking/creating user:`, dbError);
        // Continue anyway - user can still open the app
      }

      if (!user) {
        const welcomeMessage = inviteCode 
          ? `🎅 Добро пожаловать в Secret Santa!\n\n` +
            `Вас пригласили присоединиться к событию!\n\n` +
            `⚠️ Приложение находится в стадии разработки и тестирования\n` +
            `По вопросам: @airat_web3`
          : `🎅 Добро пожаловать в Secret Santa!\n\n` +
            `Организуйте обмен подарками, создавайте вишлисты и веселитесь с рандомайзерами!\n\n` +
            `⚠️ Приложение находится в стадии разработки и тестирования\n` +
            `По вопросам: @airat_web3`;
        
        await ctx.reply(welcomeMessage, { reply_markup: keyboard });
    } else {
      await ctx.reply(
        `🎄 С возвращением, ${user.name || "друг"}!\n\n` +
        `Ваши баллы: ${user.points} 🌟\n\n` +
        `⚠️ Приложение находится в стадии разработки и тестирования\n` +
        `По вопросам: @airat_web3`,
        { reply_markup: keyboard }
      );
      }
    } catch (error) {
      console.error(`[Bot] Error in /start command:`, error);
      // Send a simple error message to user
      await ctx.reply(
        `❌ Sorry, something went wrong. Please try again later.`
      );
    }
  });

  // Command: /help
  bot.command("help", async (ctx) => {
    try {
      await ctx.reply(
        `🎅 *Secret Santa Bot Help*\n\n` +
        `*Commands:*\n` +
        `/start - Open the app\n` +
        `/help - Show this help message\n` +
        `/stats - View your statistics\n\n` +
        `*Features:*\n` +
        `🎁 Create Secret Santa events\n` +
        `📝 Manage your wishlist\n` +
        `🎲 Play with randomizers (Dice & Roulette)\n` +
        `🏆 Compete on the leaderboard\n` +
        `👥 Invite friends with referral codes`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error(`[Bot] Error in /help command:`, error);
    }
  });

  // Command: /stats
  bot.command("stats", async (ctx) => {
    try {
      const telegramId = ctx.from?.id;
      if (!telegramId) return;

      let user = null;
      try {
        user = await db.getUserByTelegramId(telegramId);
      } catch (dbError) {
        console.error(`[Bot] Database error in /stats:`, dbError);
        await ctx.reply(`❌ Database temporarily unavailable. Please try again later.`);
        return;
      }
      
      if (!user) {
        await ctx.reply("❌ You need to open the app first! Use /start");
        return;
      }

      let referralCount = 0;
      try {
        referralCount = await db.getReferralCount(user.id);
      } catch (dbError) {
        console.error(`[Bot] Error getting referral count:`, dbError);
      }
      
      const level = user.points >= 500 ? "Active 🔥" : "Novice 🌱";

      await ctx.reply(
        `📊 *Your Statistics*\n\n` +
        `👤 Name: ${user.name || "Not set"}\n` +
        `⭐ Points: ${user.points}\n` +
        `📈 Level: ${level}\n` +
        `👥 Referrals: ${referralCount}\n` +
        `🔗 Referral Code: ${user.referralCode || "Not generated"}`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error(`[Bot] Error in /stats command:`, error);
    }
  });

  // Handle errors
  bot.catch((err) => {
    console.error("[Bot] Error:", err);
  });

  // Use webhook in production, polling in development
  if (NODE_ENV === "production" && WEBHOOK_URL) {
    // Webhook will be set up via the webhook endpoint
    console.log("[Bot] Bot initialized for webhook mode");
  } else {
    // Use polling in development
    bot.start({
      onStart: () => console.log("[Bot] Telegram bot started in polling mode (development)"),
    });
  }

  return bot;
}

// Export webhook handler for Express
export function getBotWebhookHandler() {
  if (!bot) {
    throw new Error("Bot not initialized");
  }
  return webhookCallback(bot, "express");
}

// Setup webhook
export async function setupWebhook() {
  if (!bot || !WEBHOOK_URL) {
    console.warn("[Bot] Cannot setup webhook: bot or webhook URL not configured");
    return false;
  }

  try {
    const webhookPath = `${WEBHOOK_URL}/api/telegram-webhook`;
    await bot.api.setWebhook(webhookPath);
    console.log(`[Bot] Webhook set to: ${webhookPath}`);
    return true;
  } catch (error) {
    console.error("[Bot] Failed to set webhook:", error);
    return false;
  }
}

// Notification functions
export async function notifyEventCreated(userId: number, eventName: string) {
  if (!bot) return;

  const user = await db.getUserByOpenId(String(userId));
  if (!user?.telegramId) return;

  try {
    await bot.api.sendMessage(
      user.telegramId,
      `🎄 *Event Created!*\n\n` +
      `Your Secret Santa event "${eventName}" has been created successfully!\n\n` +
      `Add participants and draw names to start the fun! 🎁`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("[Bot] Failed to send notification:", error);
  }
}

export async function notifyAssignment(userId: number, eventName: string, receiverName: string) {
  if (!bot) return;

  const user = await db.getUserByOpenId(String(userId));
  if (!user?.telegramId) return;

  try {
    await bot.api.sendMessage(
      user.telegramId,
      `🎅 *Secret Santa Assignment!*\n\n` +
      `Event: ${eventName}\n` +
      `You are the Secret Santa for: *${receiverName}*\n\n` +
      `Check their wishlist in the app! 🎁`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("[Bot] Failed to send notification:", error);
  }
}

export async function notifyPointsEarned(userId: number, points: number, reason: string) {
  if (!bot) return;

  const user = await db.getUserByOpenId(String(userId));
  if (!user?.telegramId) return;

  try {
    await bot.api.sendMessage(
      user.telegramId,
      `⭐ *Points Earned!*\n\n` +
      `+${points} points for ${reason}\n` +
      `Total points: ${user.points + points}`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("[Bot] Failed to send notification:", error);
  }
}

export { bot };
