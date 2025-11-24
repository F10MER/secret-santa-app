import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  santaEvents, 
  eventParticipants, 
  santaAssignments,
  wishlistItems,
  wishlistReservations,
  randomizerHistory,
  InsertSantaEvent,
  InsertEventParticipant,
  InsertSantaAssignment,
  InsertWishlistItem,
  InsertWishlistReservation,
  InsertRandomizerHistory
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.telegramId !== undefined) {
      values.telegramId = user.telegramId;
      updateSet.telegramId = user.telegramId;
    }
    if (user.referralCode !== undefined) {
      values.referralCode = user.referralCode;
    }
    if (user.referredBy !== undefined) {
      values.referredBy = user.referredBy;
    }
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByTelegramId(telegramId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Secret Santa Events
export async function createSantaEvent(event: InsertSantaEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(santaEvents).values(event);
  return Number((result as any).insertId);
}

export async function getUserEvents(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(santaEvents).where(eq(santaEvents.creatorId, userId)).orderBy(desc(santaEvents.createdAt));
}

export async function getEventById(eventId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(santaEvents).where(eq(santaEvents.id, eventId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEventStatus(eventId: number, status: "created" | "assigned") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(santaEvents).set({ status }).where(eq(santaEvents.id, eventId));
}

// Event Participants
export async function addParticipant(participant: InsertEventParticipant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(eventParticipants).values(participant);
  return Number((result as any).insertId);
}

export async function getEventParticipants(eventId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(eventParticipants).where(eq(eventParticipants.eventId, eventId));
}

// Santa Assignments
export async function createAssignments(assignments: InsertSantaAssignment[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(santaAssignments).values(assignments);
}

export async function getAssignmentForParticipant(eventId: number, giverId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(santaAssignments)
    .where(and(eq(santaAssignments.eventId, eventId), eq(santaAssignments.giverId, giverId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Wishlist
export async function createWishlistItem(item: InsertWishlistItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(wishlistItems).values(item);
  return Number((result as any).insertId);
}

export async function getUserWishlist(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId)).orderBy(desc(wishlistItems.createdAt));
}

export async function deleteWishlistItem(itemId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(wishlistItems).where(and(eq(wishlistItems.id, itemId), eq(wishlistItems.userId, userId)));
}

export async function updateWishlistPrivacy(itemId: number, userId: number, privacy: "all" | "friends") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(wishlistItems).set({ privacy }).where(and(eq(wishlistItems.id, itemId), eq(wishlistItems.userId, userId)));
}

// Randomizer History
export async function saveRandomizerResult(history: InsertRandomizerHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(randomizerHistory).values(history);
  return Number((result as any).insertId);
}

export async function getUserRandomizerHistory(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(randomizerHistory)
    .where(eq(randomizerHistory.userId, userId))
    .orderBy(desc(randomizerHistory.createdAt))
    .limit(limit);
}

// Leaderboard
export async function getLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(desc(users.points)).limit(limit);
}

// Points Management
export async function addPoints(userId: number, points: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ points: sql`${users.points} + ${points}` }).where(eq(users.id, userId));
}

export async function getReferralCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.referredBy, userId));
  return result[0]?.count || 0;
}

// Wishlist Reservations
export async function reserveWishlistItem(wishlistItemId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already reserved
  const existing = await db
    .select()
    .from(wishlistReservations)
    .where(eq(wishlistReservations.wishlistItemId, wishlistItemId))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("This item is already reserved");
  }

  const reservation: InsertWishlistReservation = {
    wishlistItemId,
    reservedBy: userId,
  };

  const result = await db.insert(wishlistReservations).values(reservation);
  return Number((result as any).insertId);
}

export async function unreserveWishlistItem(wishlistItemId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(wishlistReservations)
    .where(
      and(
        eq(wishlistReservations.wishlistItemId, wishlistItemId),
        eq(wishlistReservations.reservedBy, userId)
      )
    );
}

export async function getWishlistItemReservation(wishlistItemId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(wishlistReservations)
    .where(eq(wishlistReservations.wishlistItemId, wishlistItemId))
    .limit(1);

  return result[0] || null;
}

export async function getUserReservations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(wishlistReservations)
    .where(eq(wishlistReservations.reservedBy, userId));
}
