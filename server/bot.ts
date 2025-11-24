import { Bot, Context, InlineKeyboard, webhookCallback } from "grammy";
import * as db from "./db";

// Bot token will be provided via environment variable
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const WEBHOOK_URL = process.env.WEBHOOK_URL || "";
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

  // Command: /start
  bot.command("start", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    // Check if user exists in database
    let user = await db.getUserByTelegramId(telegramId);

    const keyboard = new InlineKeyboard()
      .webApp("🎄 Open Secret Santa App", process.env.VITE_APP_URL || "https://your-app-url.com");

    if (!user) {
      await ctx.reply(
        `🎅 Welcome to Secret Santa!\n\n` +
        `Organize gift exchanges, create wishlists, and have fun with randomizers!\n\n` +
        `Click the button below to start:`,
        { reply_markup: keyboard }
      );
    } else {
      await ctx.reply(
        `🎄 Welcome back, ${user.name || "friend"}!\n\n` +
        `Your current points: ${user.points} 🌟\n\n` +
        `Open the app to continue:`,
        { reply_markup: keyboard }
      );
    }
  });

  // Command: /help
  bot.command("help", async (ctx) => {
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
  });

  // Command: /stats
  bot.command("stats", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const user = await db.getUserByTelegramId(telegramId);
    if (!user) {
      await ctx.reply("❌ You need to open the app first! Use /start");
      return;
    }

    const referralCount = await db.getReferralCount(user.id);
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
