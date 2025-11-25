import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { santaEvents, eventParticipants, friendships } from "../../drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

/**
 * Generate a unique invite code for events
 */
function generateInviteCode(): string {
  return randomBytes(8).toString('hex'); // 16 character hex string
}

/**
 * Add friend relationship (bidirectional)
 */
async function addFriendship(userId: number, friendId: number) {
  if (userId === friendId) return; // Can't be friends with yourself
  
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  // Check if friendship already exists
  const existing = await db.select().from(friendships)
    .where(
      and(
        eq(friendships.userId, userId),
        eq(friendships.friendId, friendId)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    // Add bidirectional friendship
    await db.insert(friendships).values([
      { userId, friendId },
      { userId: friendId, friendId: userId }
    ]);
  }
}

export const eventsRouter = router({
  /**
   * Create a new Secret Santa event
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      minBudget: z.number().optional(),
      maxBudget: z.number().optional(),
      eventDate: z.string().optional(), // ISO date string
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const inviteCode = generateInviteCode();
      
      const [event] = await db.insert(santaEvents).values({
        creatorId: ctx.user.id,
        name: input.name,
        minBudget: input.minBudget,
        maxBudget: input.maxBudget,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
        inviteCode,
        status: "created",
      }).returning();

      // Automatically add creator as participant
      await db.insert(eventParticipants).values({
        eventId: event.id,
        userId: ctx.user.id,
        name: ctx.user.name || "Unknown",
        isMockUser: false,
        invitedBy: null, // Creator wasn't invited
      });

      return event;
    }),

  /**
   * Get event by invite code (public - anyone can view)
   */
  getByInviteCode: publicProcedure
    .input(z.object({
      inviteCode: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [event] = await db.select().from(santaEvents)
        .where(eq(santaEvents.inviteCode, input.inviteCode))
        .limit(1);

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      // Get participants count
      const participants = await db.select().from(eventParticipants)
        .where(eq(eventParticipants.eventId, event.id));

      return {
        ...event,
        participantCount: participants.length,
      };
    }),

  /**
   * Join event by invite code
   */
  joinByInviteCode: protectedProcedure
    .input(z.object({
      inviteCode: z.string(),
      invitedBy: z.number().optional(), // User ID who shared the link
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Find event
      const [event] = await db.select().from(santaEvents)
        .where(eq(santaEvents.inviteCode, input.inviteCode))
        .limit(1);

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      // Check if already participating
      const existing = await db.select().from(eventParticipants)
        .where(
          and(
            eq(eventParticipants.eventId, event.id),
            eq(eventParticipants.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already participating in this event" });
      }

      // Add as participant
      await db.insert(eventParticipants).values({
        eventId: event.id,
        userId: ctx.user.id,
        name: ctx.user.name || "Unknown",
        isMockUser: false,
        invitedBy: input.invitedBy || null,
      });

      // Add friend relationship if invited by someone
      if (input.invitedBy && input.invitedBy !== ctx.user.id) {
        await addFriendship(ctx.user.id, input.invitedBy);
      }

      return { success: true, event };
    }),

  /**
   * Get user's events
   */
  myEvents: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get events where user is a participant
      const participations = await db.select({
        event: santaEvents,
        participant: eventParticipants,
      })
        .from(eventParticipants)
        .innerJoin(santaEvents, eq(eventParticipants.eventId, santaEvents.id))
        .where(eq(eventParticipants.userId, ctx.user.id));

      return participations.map(p => p.event);
    }),

  /**
   * Get event details with participants
   */
  getDetails: protectedProcedure
    .input(z.object({
      eventId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if user is participant
      const [participation] = await db.select().from(eventParticipants)
        .where(
          and(
            eq(eventParticipants.eventId, input.eventId),
            eq(eventParticipants.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!participation) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant of this event" });
      }

      // Get event
      const [event] = await db.select().from(santaEvents)
        .where(eq(santaEvents.id, input.eventId))
        .limit(1);

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      // Get all participants
      const participants = await db.select().from(eventParticipants)
        .where(eq(eventParticipants.eventId, input.eventId));

      return {
        ...event,
        participants,
      };
    }),

  /**
   * Update event (only creator can update)
   */
  update: protectedProcedure
    .input(z.object({
      eventId: z.number(),
      name: z.string().min(1).max(255).optional(),
      minBudget: z.number().optional(),
      maxBudget: z.number().optional(),
      eventDate: z.string().optional(), // ISO date string
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if user is creator
      const [event] = await db.select().from(santaEvents)
        .where(eq(santaEvents.id, input.eventId))
        .limit(1);

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      if (event.creatorId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the creator can update this event" });
      }

      // Build update object
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.minBudget !== undefined) updateData.minBudget = input.minBudget;
      if (input.maxBudget !== undefined) updateData.maxBudget = input.maxBudget;
      if (input.eventDate !== undefined) updateData.eventDate = input.eventDate ? new Date(input.eventDate) : null;
      updateData.updatedAt = new Date();

      // Update event
      const [updatedEvent] = await db.update(santaEvents)
        .set(updateData)
        .where(eq(santaEvents.id, input.eventId))
        .returning();

      return updatedEvent;
    }),

  /**
   * Delete event (only creator can delete)
   */
  delete: protectedProcedure
    .input(z.object({
      eventId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if user is creator
      const [event] = await db.select().from(santaEvents)
        .where(eq(santaEvents.id, input.eventId))
        .limit(1);

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      if (event.creatorId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the creator can delete this event" });
      }

      // Delete related data first (participants, assignments, etc.)
      const { santaAssignments } = await import("../../drizzle/schema.js");
      await db.delete(santaAssignments).where(eq(santaAssignments.eventId, input.eventId));
      await db.delete(eventParticipants).where(eq(eventParticipants.eventId, input.eventId));
      
      // Delete event
      await db.delete(santaEvents).where(eq(santaEvents.id, input.eventId));

      return { success: true };
    }),

  /**
   * Get user's friends
   */
  myFriends: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get friend IDs
      const friendRelations = await db.select().from(friendships)
        .where(eq(friendships.userId, ctx.user.id));

      if (friendRelations.length === 0) {
        return [];
      }

      // Get friend details (this is a simple approach, could be optimized with a join)
      const friendIds = friendRelations.map(f => f.friendId);
      const { users } = await import("../../drizzle/schema.js");
      
      const friends = await db.select().from(users)
        .where(eq(users.id, friendIds[0])); // Note: This needs to be improved for multiple IDs

      return friends;
    }),
});
