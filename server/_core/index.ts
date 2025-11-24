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
  const app = express();
  const server = createServer(app);
  
  // Initialize Telegram bot FIRST (before registering webhook endpoint)
  initBot();
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
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
