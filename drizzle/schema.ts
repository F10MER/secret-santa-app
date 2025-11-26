import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["created", "assigned", "completed", "revealed"]);
export const privacyEnum = pgEnum("privacy", ["all", "friends"]);
export const randomizerTypeEnum = pgEnum("randomizer_type", ["dice", "roulette"]);
export const categoryEnum = pgEnum("category", ["electronics", "books", "clothing", "toys", "food", "sports", "beauty", "home", "other"]);
export const achievementTypeEnum = pgEnum("achievement_type", ["first_event", "five_events", "ten_events", "first_gift", "five_gifts", "ten_gifts", "active_user", "social_butterfly"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  telegramId: bigint("telegramId", { mode: "number" }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  points: integer("points").default(0).notNull(),
  referralCode: varchar("referralCode", { length: 32 }).unique(),
  referredBy: integer("referredBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Secret Santa Events
 */
export const santaEvents = pgTable("santa_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  creatorId: integer("creatorId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  minBudget: integer("minBudget"),
  maxBudget: integer("maxBudget"),
  eventDate: timestamp("eventDate"),
  status: statusEnum("status").default("created").notNull(),
  inviteCode: varchar("inviteCode", { length: 32 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SantaEvent = typeof santaEvents.$inferSelect;
export type InsertSantaEvent = typeof santaEvents.$inferInsert;

/**
 * Event Participants
 */
export const eventParticipants = pgTable("event_participants", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventId: integer("eventId").notNull(),
  userId: integer("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  isMockUser: boolean("isMockUser").default(false).notNull(),
  invitedBy: integer("invitedBy"), // User ID who invited this participant
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = typeof eventParticipants.$inferInsert;

/**
 * Friendships - tracks friend relationships between users
 */
export const friendships = pgTable("friendships", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  friendId: integer("friendId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;

/**
 * Secret Santa Assignments
 */
export const santaAssignments = pgTable("santa_assignments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventId: integer("eventId").notNull(),
  giverId: integer("giverId").notNull(),
  receiverId: integer("receiverId").notNull(),
  giftStatus: varchar("giftStatus", { length: 20 }).default("pending"),
  giftPhotoUrl: text("giftPhotoUrl"),
  giftNote: text("giftNote"),
  purchasedAt: timestamp("purchasedAt"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SantaAssignment = typeof santaAssignments.$inferSelect;
export type InsertSantaAssignment = typeof santaAssignments.$inferInsert;

/**
 * Wishlist Items
 */
export const wishlistItems = pgTable("wishlist_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  productLink: text("productLink"),
  price: integer("price"),
  category: categoryEnum("category").default("other"),
  privacy: privacyEnum("privacy").default("all").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = typeof wishlistItems.$inferInsert;

/**
 * Randomizer History (Dice & Roulette)
 */
export const randomizerHistory = pgTable("randomizer_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  type: randomizerTypeEnum("type").notNull(),
  result: text("result").notNull(), // JSON string with results
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RandomizerHistory = typeof randomizerHistory.$inferSelect;
export type InsertRandomizerHistory = typeof randomizerHistory.$inferInsert;

/**
 * Wishlist Item Reservations (for gift booking)
 */
export const wishlistReservations = pgTable("wishlist_reservations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  wishlistItemId: integer("wishlistItemId").notNull(),
  reservedBy: integer("reservedBy").notNull(), // User ID who reserved
  deadline: timestamp("deadline"), // Optional deadline for gift preparation
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WishlistReservation = typeof wishlistReservations.$inferSelect;
export type InsertWishlistReservation = typeof wishlistReservations.$inferInsert;

/**
 * User Statistics
 */
export const userStatistics = pgTable("user_statistics", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull().unique(),
  eventsParticipated: integer("eventsParticipated").default(0).notNull(),
  giftsGiven: integer("giftsGiven").default(0).notNull(),
  giftsReceived: integer("giftsReceived").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserStatistics = typeof userStatistics.$inferSelect;
export type InsertUserStatistics = typeof userStatistics.$inferInsert;

/**
 * User Achievements
 */
export const userAchievements = pgTable("user_achievements", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  achievementType: achievementTypeEnum("achievementType").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * Event Chat Messages
 */
export const eventMessages = pgTable("event_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventId: integer("eventId").notNull(),
  userId: integer("userId").notNull(),
  message: text("message").notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventMessage = typeof eventMessages.$inferSelect;
export type InsertEventMessage = typeof eventMessages.$inferInsert;

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

export const userStatisticsRelations = relations(userStatistics, ({ one }) => ({
  user: one(users, {
    fields: [userStatistics.userId],
    references: [users.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
}));

export const eventMessagesRelations = relations(eventMessages, ({ one }) => ({
  event: one(santaEvents, {
    fields: [eventMessages.eventId],
    references: [santaEvents.id],
  }),
  user: one(users, {
    fields: [eventMessages.userId],
    references: [users.id],
  }),
}));
