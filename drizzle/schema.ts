import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, bigint } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  telegramId: bigint("telegramId", { mode: "number" }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  points: int("points").default(0).notNull(),
  referralCode: varchar("referralCode", { length: 32 }).unique(),
  referredBy: int("referredBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Secret Santa Events
 */
export const santaEvents = mysqlTable("santa_events", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  minBudget: int("minBudget"),
  maxBudget: int("maxBudget"),
  eventDate: timestamp("eventDate"),
  status: mysqlEnum("status", ["created", "assigned"]).default("created").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SantaEvent = typeof santaEvents.$inferSelect;
export type InsertSantaEvent = typeof santaEvents.$inferInsert;

/**
 * Event Participants
 */
export const eventParticipants = mysqlTable("event_participants", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  isMockUser: boolean("isMockUser").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = typeof eventParticipants.$inferInsert;

/**
 * Secret Santa Assignments
 */
export const santaAssignments = mysqlTable("santa_assignments", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  giverId: int("giverId").notNull(),
  receiverId: int("receiverId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SantaAssignment = typeof santaAssignments.$inferSelect;
export type InsertSantaAssignment = typeof santaAssignments.$inferInsert;

/**
 * Wishlist Items
 */
export const wishlistItems = mysqlTable("wishlist_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  privacy: mysqlEnum("privacy", ["all", "friends"]).default("all").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = typeof wishlistItems.$inferInsert;

/**
 * Randomizer History (Dice & Roulette)
 */
export const randomizerHistory = mysqlTable("randomizer_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["dice", "roulette"]).notNull(),
  result: text("result").notNull(), // JSON string with results
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RandomizerHistory = typeof randomizerHistory.$inferSelect;
export type InsertRandomizerHistory = typeof randomizerHistory.$inferInsert;

/**
 * Wishlist Item Reservations (for gift booking)
 */
export const wishlistReservations = mysqlTable("wishlist_reservations", {
  id: int("id").autoincrement().primaryKey(),
  wishlistItemId: int("wishlistItemId").notNull(),
  reservedBy: int("reservedBy").notNull(), // User ID who reserved
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WishlistReservation = typeof wishlistReservations.$inferSelect;
export type InsertWishlistReservation = typeof wishlistReservations.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  createdEvents: many(santaEvents),
  participations: many(eventParticipants),
  wishlistItems: many(wishlistItems),
  randomizerHistory: many(randomizerHistory),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
  referrals: many(users),
}));

export const santaEventsRelations = relations(santaEvents, ({ one, many }) => ({
  creator: one(users, {
    fields: [santaEvents.creatorId],
    references: [users.id],
  }),
  participants: many(eventParticipants),
  assignments: many(santaAssignments),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(santaEvents, {
    fields: [eventParticipants.eventId],
    references: [santaEvents.id],
  }),
  user: one(users, {
    fields: [eventParticipants.userId],
    references: [users.id],
  }),
}));

export const santaAssignmentsRelations = relations(santaAssignments, ({ one }) => ({
  event: one(santaEvents, {
    fields: [santaAssignments.eventId],
    references: [santaEvents.id],
  }),
  giver: one(eventParticipants, {
    fields: [santaAssignments.giverId],
    references: [eventParticipants.id],
  }),
  receiver: one(eventParticipants, {
    fields: [santaAssignments.receiverId],
    references: [eventParticipants.id],
  }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one, many }) => ({
  user: one(users, {
    fields: [wishlistItems.userId],
    references: [users.id],
  }),
  reservations: many(wishlistReservations),
}));

export const wishlistReservationsRelations = relations(wishlistReservations, ({ one }) => ({
  wishlistItem: one(wishlistItems, {
    fields: [wishlistReservations.wishlistItemId],
    references: [wishlistItems.id],
  }),
  reservedByUser: one(users, {
    fields: [wishlistReservations.reservedBy],
    references: [users.id],
  }),
}));

export const randomizerHistoryRelations = relations(randomizerHistory, ({ one }) => ({
  user: one(users, {
    fields: [randomizerHistory.userId],
    references: [users.id],
  }),
}));
