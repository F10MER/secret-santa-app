import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
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
let _pool: Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Parse DATABASE_URL to check if it requires SSL
      // Only use SSL if explicitly required in the connection string
      // Internal Easypanel databases (10.0.x.x) don't support SSL
      const dbUrl = process.env.DATABASE_URL;
      const isInternalDb = dbUrl.includes('10.0.') || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
      
      // Determine SSL configuration
      let sslConfig: boolean | { rejectUnauthorized: boolean } = false;
      
      if (isInternalDb) {
        // Internal databases: explicitly disable SSL
        sslConfig = false;
        console.log('[Database] Internal database detected (10.0.x.x), SSL explicitly disabled');
      } else if (dbUrl.includes('sslmode=require')) {
        // External databases with explicit SSL requirement
        sslConfig = { rejectUnauthorized: false };
        console.log('[Database] External database with SSL required');
      } else {
        // Default: no SSL
        sslConfig = false;
        console.log('[Database] SSL disabled by default');
      }
      
      _pool = new Pool({
        connectionString: dbUrl,
        ssl: sslConfig,
        // Connection pool settings
        max: 10, // maximum number of clients
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
      
      // Test connection
      try {
        const client = await _pool.connect();
        console.log('[Database] Connection test successful');
        client.release();
      } catch (testError) {
        console.error('[Database] Connection test failed:', testError);
        // Don't throw - allow app to start even if DB is temporarily unavailable
      }
      
      _db = drizzle(_pool);
      console.log('[Database] Connection pool created successfully');
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

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
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

export async function createUser(userData: { telegramId: number; name: string; loginMethod: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(users).values({
      openId: `telegram_${userData.telegramId}`,
      telegramId: userData.telegramId,
      name: userData.name,
      loginMethod: userData.loginMethod,
      lastSignedIn: new Date(),
    }).returning({ id: users.id });
    
    return result[0]?.id;
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    throw error;
  }
}

// Secret Santa Events
export async function createSantaEvent(event: InsertSantaEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(santaEvents).values(event).returning({ id: santaEvents.id });
  return result[0]?.id;
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

  const result = await db.insert(eventParticipants).values(participant).returning({ id: eventParticipants.id });
  return result[0]?.id;
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

export async function updateGiftStatus(
  assignmentId: number,
  data: {
    status: string;
    photoUrl?: string;
    note?: string;
    purchasedAt?: Date;
    deliveredAt?: Date;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(santaAssignments)
    .set({
      giftStatus: data.status,
      giftPhotoUrl: data.photoUrl,
      giftNote: data.note,
      purchasedAt: data.purchasedAt,
      deliveredAt: data.deliveredAt,
    })
    .where(eq(santaAssignments.id, assignmentId));
}

// Wishlist
export async function createWishlistItem(item: InsertWishlistItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(wishlistItems).values(item).returning({ id: wishlistItems.id });
  return result[0]?.id;
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

  const result = await db.insert(randomizerHistory).values(history).returning({ id: randomizerHistory.id });
  return result[0]?.id;
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

  const result = await db.insert(wishlistReservations).values(reservation).returning({ id: wishlistReservations.id });
  return result[0]?.id;
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

  const reservations = await db
    .select({
      id: wishlistReservations.id,
      wishlistItemId: wishlistReservations.wishlistItemId,
      reservedBy: wishlistReservations.reservedBy,
      deadline: wishlistReservations.deadline,
      createdAt: wishlistReservations.createdAt,
      itemTitle: wishlistItems.title,
      itemDescription: wishlistItems.description,
      itemImageUrl: wishlistItems.imageUrl,
      ownerId: wishlistItems.userId,
      ownerName: users.name,
    })
    .from(wishlistReservations)
    .leftJoin(wishlistItems, eq(wishlistReservations.wishlistItemId, wishlistItems.id))
    .leftJoin(users, eq(wishlistItems.userId, users.id))
    .where(eq(wishlistReservations.reservedBy, userId))
    .orderBy(sql`CASE WHEN ${wishlistReservations.deadline} IS NULL THEN 1 ELSE 0 END, ${wishlistReservations.deadline} ASC`);

  return reservations;
}

export async function updateReservationDeadline(wishlistItemId: number, userId: number, deadline: Date | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(wishlistReservations)
    .set({ deadline })
    .where(
      and(
        eq(wishlistReservations.wishlistItemId, wishlistItemId),
        eq(wishlistReservations.reservedBy, userId)
      )
    );
}

// Event Invite Codes
export async function updateEventInviteCode(eventId: number, inviteCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(santaEvents).set({ inviteCode }).where(eq(santaEvents.id, eventId));
}

export async function getEventByInviteCode(inviteCode: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(santaEvents).where(eq(santaEvents.inviteCode, inviteCode)).limit(1);
  return result[0] || null;
}

// User Statistics
export async function getUserStatistics(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const { userStatistics } = await import("../drizzle/schema");
  const result = await db.select().from(userStatistics).where(eq(userStatistics.userId, userId)).limit(1);
  
  if (result[0]) return result[0];

  // Create if doesn't exist
  const newStats = { userId };
  const created = await db.insert(userStatistics).values(newStats).returning();
  return created[0] || null;
}

export async function updateUserStatistics(userId: number, updates: {
  eventsParticipated?: number;
  giftsGiven?: number;
  giftsReceived?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { userStatistics } = await import("../drizzle/schema");
  await db.update(userStatistics).set({ ...updates, updatedAt: new Date() }).where(eq(userStatistics.userId, userId));
}

export async function incrementUserStats(userId: number, field: 'eventsParticipated' | 'giftsGiven' | 'giftsReceived') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { userStatistics } = await import("../drizzle/schema");
  const stats = await getUserStatistics(userId);
  if (!stats) return;

  const newValue = (stats[field] || 0) + 1;
  await updateUserStatistics(userId, { [field]: newValue });
}

export async function getStatisticsLeaderboard(limit: number, sortBy: 'events' | 'gifts_given' | 'gifts_received') {
  const db = await getDb();
  if (!db) return [];

  const { userStatistics } = await import("../drizzle/schema");
  const fieldMap = {
    events: userStatistics.eventsParticipated,
    gifts_given: userStatistics.giftsGiven,
    gifts_received: userStatistics.giftsReceived,
  };

  const result = await db
    .select({
      userId: userStatistics.userId,
      userName: users.name,
      eventsParticipated: userStatistics.eventsParticipated,
      giftsGiven: userStatistics.giftsGiven,
      giftsReceived: userStatistics.giftsReceived,
    })
    .from(userStatistics)
    .leftJoin(users, eq(userStatistics.userId, users.id))
    .orderBy(sql`${fieldMap[sortBy]} DESC`)
    .limit(limit);

  return result;
}

// User Achievements
export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const { userAchievements } = await import("../drizzle/schema");
  return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
}

export async function getUserAchievementByType(userId: number, achievementType: string) {
  const db = await getDb();
  if (!db) return null;

  const { userAchievements } = await import("../drizzle/schema");
  const result = await db
    .select()
    .from(userAchievements)
    .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementType, achievementType as any)))
    .limit(1);

  return result[0] || null;
}

export async function createUserAchievement(data: { userId: number; achievementType: any }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { userAchievements } = await import("../drizzle/schema");
  const result = await db.insert(userAchievements).values(data).returning({ id: userAchievements.id });
  return result[0]?.id;
}

// Event Messages (Chat)
export async function createEventMessage(data: {
  eventId: number;
  userId: number;
  message: string;
  isAnonymous: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { eventMessages } = await import("../drizzle/schema");
  const result = await db.insert(eventMessages).values(data).returning({ id: eventMessages.id });
  return result[0]?.id;
}

export async function getEventMessages(eventId: number, limit: number) {
  const db = await getDb();
  if (!db) return [];

  const { eventMessages } = await import("../drizzle/schema");
  const messages = await db
    .select({
      id: eventMessages.id,
      eventId: eventMessages.eventId,
      userId: eventMessages.userId,
      userName: users.name,
      message: eventMessages.message,
      isAnonymous: eventMessages.isAnonymous,
      createdAt: eventMessages.createdAt,
    })
    .from(eventMessages)
    .leftJoin(users, eq(eventMessages.userId, users.id))
    .where(eq(eventMessages.eventId, eventId))
    .orderBy(sql`${eventMessages.createdAt} DESC`)
    .limit(limit);

  return messages.reverse(); // Return in chronological order
}


// Create or update user from Telegram auth
export async function createOrUpdateUser(data: {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const telegramIdNum = parseInt(data.telegramId);
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');

  // Check if user exists
  const existing = await db.select().from(users).where(eq(users.telegramId, telegramIdNum)).limit(1);

  if (existing.length > 0) {
    // Update existing user
    await db.update(users)
      .set({
        name: fullName,
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      })
      .where(eq(users.id, existing[0]!.id));
    return existing[0]!.id;
  } else {
    // Create new user
    const result = await db.insert(users).values({
      telegramId: telegramIdNum,
      name: fullName,
      openId: `telegram:${data.telegramId}`, // For compatibility with existing auth system
      loginMethod: 'telegram',
    }).returning({ id: users.id });
    return result[0]!.id;
  }
}
