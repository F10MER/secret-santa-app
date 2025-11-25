CREATE TYPE "public"."achievement_type" AS ENUM('first_event', 'five_events', 'ten_events', 'first_gift', 'five_gifts', 'ten_gifts', 'active_user', 'social_butterfly');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('electronics', 'books', 'clothing', 'toys', 'food', 'sports', 'beauty', 'home', 'other');--> statement-breakpoint
CREATE TABLE "event_messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "event_messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"eventId" integer NOT NULL,
	"userId" integer NOT NULL,
	"message" text NOT NULL,
	"isAnonymous" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_achievements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"achievementType" "achievement_type" NOT NULL,
	"unlockedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_statistics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_statistics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"eventsParticipated" integer DEFAULT 0 NOT NULL,
	"giftsGiven" integer DEFAULT 0 NOT NULL,
	"giftsReceived" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_statistics_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "santa_events" ADD COLUMN "inviteCode" varchar(32);--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD COLUMN "productLink" text;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD COLUMN "price" integer;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD COLUMN "category" "category" DEFAULT 'other';--> statement-breakpoint
ALTER TABLE "santa_events" ADD CONSTRAINT "santa_events_inviteCode_unique" UNIQUE("inviteCode");