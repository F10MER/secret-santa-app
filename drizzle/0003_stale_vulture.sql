ALTER TABLE "santa_assignments" ADD COLUMN "giftStatus" varchar(20) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "santa_assignments" ADD COLUMN "giftPhotoUrl" text;--> statement-breakpoint
ALTER TABLE "santa_assignments" ADD COLUMN "giftNote" text;--> statement-breakpoint
ALTER TABLE "santa_assignments" ADD COLUMN "purchasedAt" timestamp;--> statement-breakpoint
ALTER TABLE "santa_assignments" ADD COLUMN "deliveredAt" timestamp;