import { describe, expect, it } from "vitest";
import { Bot } from "grammy";

describe("Telegram Bot Token Validation", () => {
  it("should validate bot token by calling getMe", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set");
    }

    const bot = new Bot(token);
    
    try {
      const me = await bot.api.getMe();
      expect(me).toBeDefined();
      expect(me.is_bot).toBe(true);
      expect(me.username).toBeDefined();
      console.log(`[Bot Test] Bot validated: @${me.username}`);
    } catch (error) {
      throw new Error(`Invalid bot token: ${error}`);
    }
  }, 10000); // 10 second timeout
});
