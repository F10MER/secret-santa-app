import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";
import { eq, sql, and } from "drizzle-orm";
import { users, userAchievements, friendships, santaEvents } from "../drizzle/schema";
import { featuresRouter } from "./features-router";
import { eventsRouter } from "./routers/events.js";

// Helper function to shuffle array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

export const appRouter = router({
  system: systemRouter,
  features: featuresRouter,
  events: eventsRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Secret Santa Events
  santa: router({
    // Create new event
    createEvent: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        minBudget: z.number().optional(),
        maxBudget: z.number().optional(),
        eventDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const eventId = await db.createSantaEvent({
          creatorId: ctx.user.id,
          name: input.name,
          minBudget: input.minBudget,
          maxBudget: input.maxBudget,
          eventDate: input.eventDate,
        });
        return { eventId };
      }),

    // Get user's events
    getMyEvents: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserEvents(ctx.user.id);
    }),

    // Get event details
    getEvent: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        const event = await db.getEventById(input.eventId);
        if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
        return event;
      }),

    // Add participant
    addParticipant: protectedProcedure
      .input(z.object({
        eventId: z.number(),
        name: z.string().min(1).max(255),
        userId: z.number().optional(),
        isMockUser: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const participantId = await db.addParticipant({
          eventId: input.eventId,
          name: input.name,
          userId: input.userId,
          isMockUser: input.isMockUser,
        });
        return { participantId };
      }),

    // Get event participants
    getParticipants: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEventParticipants(input.eventId);
      }),

    // Draw names (assign Secret Santa)
    drawNames: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ input }) => {
        const participants = await db.getEventParticipants(input.eventId);
        
        if (participants.length < 2) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Need at least 2 participants" 
          });
        }

        // Get event details for notification
        const event = await db.getEventById(input.eventId);
        if (!event) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
        }

        // Shuffle participants for random assignment
        const shuffled = shuffleArray(participants);
        const assignments = shuffled.map((giver, index) => ({
          eventId: input.eventId,
          giverId: giver.id,
          receiverId: shuffled[(index + 1) % shuffled.length]!.id,
        }));

        await db.createAssignments(assignments);
        await db.updateEventStatus(input.eventId, "assigned");

        // Send notifications to all participants
        const { notifyAssignment } = await import("./bot.js");
        for (let i = 0; i < shuffled.length; i++) {
          const giver = shuffled[i];
          const receiver = shuffled[(i + 1) % shuffled.length];
          if (giver?.userId && receiver) {
            // Send notification asynchronously (don't block)
            notifyAssignment(giver.userId, event.name, receiver.name).catch(err => {
              console.error(`[Bot] Failed to notify user ${giver.userId}:`, err);
            });
          }
        }

        return { success: true };
      }),

    // Get my assignment
    getMyAssignment: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Find participant record for current user
        const participants = await db.getEventParticipants(input.eventId);
        const myParticipant = participants.find(p => p.userId === ctx.user.id);
        
        if (!myParticipant) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "You are not a participant in this event" 
          });
        }

        const assignment = await db.getAssignmentForParticipant(input.eventId, myParticipant.id);
        if (!assignment) return null;

        // Get receiver details
        const receiver = participants.find(p => p.id === assignment.receiverId);
        return { receiver, assignment };
      }),

    // Update gift status
    updateGiftStatus: protectedProcedure
      .input(z.object({
        eventId: z.number(),
        status: z.enum(["pending", "purchased", "delivered"]),
        photoUrl: z.string().optional(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Find participant record for current user
        const participants = await db.getEventParticipants(input.eventId);
        const myParticipant = participants.find(p => p.userId === ctx.user.id);
        
        if (!myParticipant) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "You are not a participant in this event" 
          });
        }

        const assignment = await db.getAssignmentForParticipant(input.eventId, myParticipant.id);
        if (!assignment) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "No assignment found" 
          });
        }

        // Update assignment with gift tracking info
        await db.updateGiftStatus(assignment.id, {
          status: input.status,
          photoUrl: input.photoUrl,
          note: input.note,
          purchasedAt: input.status === "purchased" ? new Date() : undefined,
          deliveredAt: input.status === "delivered" ? new Date() : undefined,
        });

        return { success: true };
      }),
  }),

  // Wishlist
  wishlist: router({
    // Create wishlist item
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        privacy: z.enum(["all", "friends"]).default("all"),
      }))
      .mutation(async ({ ctx, input }) => {
        const itemId = await db.createWishlistItem({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          imageUrl: input.imageUrl,
          privacy: input.privacy,
        });
        return { itemId };
      }),

    // Get my wishlist
    getMy: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserWishlist(ctx.user.id);
    }),

    // Delete wishlist item
    delete: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteWishlistItem(input.itemId, ctx.user.id);
        return { success: true };
      }),

    // Update privacy
    updatePrivacy: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        privacy: z.enum(["all", "friends"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateWishlistPrivacy(input.itemId, ctx.user.id, input.privacy);
        return { success: true };
      }),

    // Get public wishlist by user ID
    getPublicWishlist: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const wishlist = await db.getUserWishlist(input.userId);
        // Filter only public items
        return wishlist.filter(item => item.privacy === 'all');
      }),

    // Upload image
    uploadImage: protectedProcedure
      .input(z.object({
        imageData: z.string(), // base64
        fileName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64 and check size (5MB limit)
        const buffer = Buffer.from(input.imageData, 'base64');
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (buffer.length > maxSize) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Image size exceeds 5MB limit" 
          });
        }

        // Upload to S3
        const fileKey = `wishlist/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");
        
        return { url };
      }),

    // Reserve gift
    reserveGift: protectedProcedure
      .input(z.object({ wishlistItemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const reservationId = await db.reserveWishlistItem(input.wishlistItemId, ctx.user.id);
          return { success: true, reservationId };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message || "Failed to reserve gift"
          });
        }
      }),

    // Unreserve gift
    unreserveGift: protectedProcedure
      .input(z.object({ wishlistItemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.unreserveWishlistItem(input.wishlistItemId, ctx.user.id);
        return { success: true };
      }),

    // Get reservation status
    getReservation: publicProcedure
      .input(z.object({ wishlistItemId: z.number() }))
      .query(async ({ input }) => {
        return await db.getWishlistItemReservation(input.wishlistItemId);
      }),

    // Get my reservations
    getMyReservations: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserReservations(ctx.user.id);
    }),

    // Update reservation deadline
    updateDeadline: protectedProcedure
      .input(z.object({
        wishlistItemId: z.number(),
        deadline: z.date().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateReservationDeadline(input.wishlistItemId, ctx.user.id, input.deadline);
        return { success: true };
      }),
  }),

  // Randomizers
  randomizer: router({
    // Roll dice
    rollDice: protectedProcedure.mutation(async ({ ctx }) => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const result = { dice1, dice2, sum: dice1 + dice2 };

      await db.saveRandomizerResult({
        userId: ctx.user.id,
        type: "dice",
        result: JSON.stringify(result),
      });

      // Award points
      await db.addPoints(ctx.user.id, 10);

      return result;
    }),

    // Spin roulette
    spinRoulette: protectedProcedure
      .input(z.object({
        participants: z.array(z.string()).min(3).max(100),
      }))
      .mutation(async ({ ctx, input }) => {
        const winnerIndex = Math.floor(Math.random() * input.participants.length);
        const winner = input.participants[winnerIndex]!;
        const result = { winner, winnerIndex };

        await db.saveRandomizerResult({
          userId: ctx.user.id,
          type: "roulette",
          result: JSON.stringify({ participants: input.participants, ...result }),
        });

        // Award points
        await db.addPoints(ctx.user.id, 15);

        return result;
      }),

    // Get history
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        const history = await db.getUserRandomizerHistory(ctx.user.id, input.limit);
        return history.map(h => ({
          ...h,
          result: JSON.parse(h.result),
        }));
      }),
  }),

  // Achievements
  achievements: router({    
    // Get user achievements
    getMyAchievements: protectedProcedure.query(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) return [];
      
      const achievements = await database
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, ctx.user.id));
      
      return achievements;
    }),
    
    // Check and award achievements
    checkAchievements: protectedProcedure.mutation(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) return { newAchievements: [] };
      
      const newAchievements: string[] = [];
      
      // Check first_event achievement
      const eventsCount = await database
        .select({ count: sql<number>`count(*)` })
        .from(santaEvents)
        .where(eq(santaEvents.creatorId, ctx.user.id));
      
      if (eventsCount[0]?.count >= 1) {
        const hasAchievement = await database
          .select()
          .from(userAchievements)
          .where(and(
            eq(userAchievements.userId, ctx.user.id),
            eq(userAchievements.achievementType, 'first_event')
          ));
        
        if (hasAchievement.length === 0) {
          await database.insert(userAchievements).values({
            userId: ctx.user.id,
            achievementType: 'first_event',
          });
          newAchievements.push('first_event');
        }
      }
      
      // Check five_friends achievement
      const friendsCount = await database
        .select({ count: sql<number>`count(*)` })
        .from(friendships)
        .where(eq(friendships.userId, ctx.user.id));
      
      if (friendsCount[0]?.count >= 5) {
        const hasAchievement = await database
          .select()
          .from(userAchievements)
          .where(and(
            eq(userAchievements.userId, ctx.user.id),
            eq(userAchievements.achievementType, 'five_gifts')
          ));
        
        if (hasAchievement.length === 0) {
          await database.insert(userAchievements).values({
            userId: ctx.user.id,
            achievementType: 'five_gifts',
          });
          newAchievements.push('five_gifts');
        }
      }
      
      return { newAchievements };
    }),
  }),

  // Profile & Leaderboard
  profile: router({
    // Get leaderboard
    getLeaderboard: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await db.getLeaderboard(input.limit);
      }),

    // Get user stats
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const referralCount = await db.getReferralCount(ctx.user.id);
      return {
        points: ctx.user.points,
        referrals: referralCount,
        level: ctx.user.points >= 500 ? "Active" : "Novice",
      };
    }),

    // Generate referral code
    generateReferralCode: protectedProcedure.mutation(async ({ ctx }) => {
      const code = `REF-${ctx.user.id}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      const database = await db.getDb();
      if (database) {
        await database.update(users).set({ referralCode: code }).where(eq(users.id, ctx.user.id));
      }
      return { code };
    }),
  }),
});

export type AppRouter = typeof appRouter;
