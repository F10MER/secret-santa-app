import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth.js";
import { appRouter } from "../routers.js";
import { createContext } from "./context.js";
import { serveStatic } from "./static.js";
import { initBot, getBotWebhookHandler, setupWebhook } from "../bot.js";
import { validateTelegramWebAppData, generateAuthToken } from "../auth.js";
import * as db from "../db.js";
import { getTelegramAvatar } from "../telegram-avatar.js";
import uploadImageRouter from "../upload-image.js";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  console.log('='.repeat(60));
  console.log('🎄 Secret Santa App - Version: SSL_FIX_v2 (2024-11-25)');
  console.log('='.repeat(60));
  
  const app = express();
  const server = createServer(app);
  
  // Initialize Telegram bot FIRST (before registering webhook endpoint)
  initBot();
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Telegram auth endpoint
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const { initData } = req.body;
      
      if (!initData) {
        return res.status(400).json({ error: "initData is required" });
      }

      const user = validateTelegramWebAppData(initData);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid initData" });
      }

      // Generate JWT token
      const token = generateAuthToken(user);
      
      // Store or update user in database
      await db.createOrUpdateUser({
        telegramId: user.id.toString(),
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
      });

      res.json({ token, user });
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
  
  // Telegram avatar endpoint
  app.get("/api/telegram-avatar/:userId", getTelegramAvatar);
  
  // Image upload endpoint
  app.use("/api", uploadImageRouter);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Telegram webhook endpoint (bot must be initialized first)
  if (process.env.NODE_ENV === "production" && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const webhookHandler = getBotWebhookHandler();
      app.use("/api/telegram-webhook", webhookHandler);
      console.log("[Bot] Webhook endpoint registered at /api/telegram-webhook");
    } catch (error) {
      console.warn("[Bot] Failed to register webhook endpoint:", error);
    }
  }
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);

    // Setup webhook in production
    if (process.env.NODE_ENV === "production" && process.env.WEBHOOK_URL) {
      setTimeout(async () => {
        await setupWebhook();
      }, 2000); // Wait 2 seconds for server to be fully ready
    }
  });
}

startServer().catch(console.error);
