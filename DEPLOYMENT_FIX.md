# Deployment Fix - All Required Changes

This document contains ALL the file changes needed to fix deployment issues.

## Files to Update in GitHub

### 1. `start.sh`

**Complete file content:**

```sh
#!/bin/sh
set -e

echo "Starting Secret Santa application..."

# Start the application directly
exec node dist/index.js
```

### 2. `server/_core/index.ts`

**Line 9 - Change import:**
```typescript
// OLD:
import { serveStatic, setupVite } from "./vite";

// NEW:
import { serveStatic } from "./vite";
```

**Lines 47-53 - Change vite setup:**
```typescript
// OLD:
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

// NEW:
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
```

### 3. `server/_core/vite.ts`

**Lines 6-7 - Remove vite.config import:**
```typescript
// OLD:
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

// NEW:
import { createServer as createViteServer } from "vite";
```

**Lines 15-20 - Simplify vite config:**
```typescript
// OLD:
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

// NEW:
  const vite = await createViteServer({
    configFile: false,
    root: path.resolve(import.meta.dirname, "../..", "client"),
    server: serverOptions,
    appType: "custom",
  });
```

### 4. `Dockerfile`

**Lines 11-16 - Add patches directory:**
```dockerfile
# OLD:
# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# NEW:
# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies
RUN pnpm install --frozen-lockfile
```

**Lines 33-38 - Add patches directory (production stage):**
```dockerfile
# OLD:
# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# NEW:
# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile
```

**Lines 40-42 - Fix dist copy:**
```dockerfile
# OLD:
# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# NEW:
# Copy built files from builder
COPY --from=builder /app/dist ./dist
```

## Complete File Contents (for easy copy-paste)

### Complete `start.sh`:
```sh
#!/bin/sh
set -e

echo "Starting Secret Santa application..."

# Start the application directly
exec node dist/index.js
```

### Complete `server/_core/vite.ts`:
```typescript
import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    configFile: false,
    root: path.resolve(import.meta.dirname, "../..", "client"),
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
```

## After Updating Files

1. **Push all changes to GitHub**
2. **In Easypanel: Click "Redeploy"**
3. **Wait for build to complete** (should succeed now)
4. **Container should start successfully**
5. **Run migrations ONCE via console:**
   ```bash
   docker exec -it <container-name> sh
   cd /app
   pnpm install drizzle-kit --save-dev
   pnpm db:push
   exit
   ```
6. **Restart container in Easypanel**
7. **Test the application!**

## Verification

After deployment, check:
- Container is running (not restarting)
- Logs show "Server running on http://localhost:3000/"
- No error messages in logs
- Application accessible via Easypanel URL
