import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { generateInviteCode, generateInviteLink, checkAchievement } from "./utils";

/**
 * New features router: invites, statistics, achievements, chat
 */
export const featuresRouter = router({
  // Invite System
  invites: router({
    // Generate invite link for event
    generateInviteLink: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const event = await db.getEventById(input.eventId);
        if (!event) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
        }
        
        if (event.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only event creator can generate invite links" });
        }

        // Generate invite code if not exists
        let inviteCode = event.inviteCode;
        if (!inviteCode) {
          inviteCode = generateInviteCode();
          await db.updateEventInviteCode(input.eventId, inviteCode);
        }

        const appUrl = process.env.VITE_APP_URL || 'https://your-app-url.com';
        const inviteLink = generateInviteLink(inviteCode, appUrl);

        return { inviteCode, inviteLink };
      }),

    // Join event by invite code
    joinByInvite: protectedProcedure
      .input(z.object({ inviteCode: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const event = await db.getEventByInviteCode(input.inviteCode);
        if (!event) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invite code" });
        }

        // Check if already participant
        const participants = await db.getEventParticipants(event.id);
        const alreadyJoined = participants.some(p => p.userId === ctx.user.id);
        
        if (alreadyJoined) {
          return { eventId: event.id, alreadyJoined: true };
        }

        // Add as participant
        await db.addParticipant({
          eventId: event.id,
          userId: ctx.user.id,
          name: ctx.user.name || 'Anonymous',
          isMockUser: false,
        });

        return { eventId: event.id, alreadyJoined: false };
      }),
  }),

  // Statistics
  statistics: router({
    // Get user statistics
    getMyStats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserStatistics(ctx.user.id);
    }),

    // Get leaderboard
    getLeaderboard: protectedProcedure
      .input(z.object({ 
        limit: z.number().min(1).max(100).default(10),
        sortBy: z.enum(['events', 'gifts_given', 'gifts_received']).default('events'),
      }))
      .query(async ({ input }) => {
        return await db.getStatisticsLeaderboard(input.limit, input.sortBy);
      }),
  }),

  // Achievements
  achievements: router({
    // Get user achievements
    getMyAchievements: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAchievements(ctx.user.id);
    }),

    // Check and unlock achievements (called internally after actions)
    checkAndUnlock: protectedProcedure
      .input(z.object({
        type: z.enum(['events', 'gifts_given', 'gifts_received']),
        count: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const newAchievements = checkAchievement(input.type, input.count);
        const unlocked: string[] = [];

        for (const achievementType of newAchievements) {
          const existing = await db.getUserAchievementByType(ctx.user.id, achievementType as any);
          if (!existing) {
            await db.createUserAchievement({
              userId: ctx.user.id,
              achievementType: achievementType as any,
            });
            unlocked.push(achievementType);
          }
        }

        return { unlocked };
      }),
  }),

  // Event Chat
  chat: router({
    // Send message in event chat
    sendMessage: protectedProcedure
      .input(z.object({
        eventId: z.number(),
        message: z.string().min(1).max(1000),
        isAnonymous: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is participant
        const participants = await db.getEventParticipants(input.eventId);
        const isParticipant = participants.some(p => p.userId === ctx.user.id);
        
        if (!isParticipant) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only participants can send messages" });
        }

        const messageId = await db.createEventMessage({
          eventId: input.eventId,
          userId: ctx.user.id,
          message: input.message,
          isAnonymous: input.isAnonymous,
        });

        return { messageId };
      }),

    // Get event messages
    getMessages: protectedProcedure
      .input(z.object({
        eventId: z.number(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        // Check if user is participant
        const participants = await db.getEventParticipants(input.eventId);
        const isParticipant = participants.some(p => p.userId === ctx.user.id);
        
        if (!isParticipant) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only participants can view messages" });
        }

        return await db.getEventMessages(input.eventId, input.limit);
      }),
  }),
});
