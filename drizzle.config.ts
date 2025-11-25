import { defineConfig } from "drizzle-kit";

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// For internal Easypanel databases, disable SSL
const isInternalDb = connectionString.includes('10.0.') || connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
if (isInternalDb && !connectionString.includes('sslmode=')) {
  const separator = connectionString.includes('?') ? '&' : '?';
  connectionString = `${connectionString}${separator}sslmode=disable`;
  console.log('[Drizzle] Internal database detected, SSL disabled');
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
