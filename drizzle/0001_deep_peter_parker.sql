CREATE TABLE `event_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`isMockUser` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `randomizer_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('dice','roulette') NOT NULL,
	`result` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `randomizer_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `santa_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`giverId` int NOT NULL,
	`receiverId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `santa_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `santa_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`minBudget` int,
	`maxBudget` int,
	`eventDate` timestamp,
	`status` enum('created','assigned') NOT NULL DEFAULT 'created',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `santa_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`privacy` enum('all','friends') NOT NULL DEFAULT 'all',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wishlist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `telegramId` bigint;--> statement-breakpoint
ALTER TABLE `users` ADD `points` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `referredBy` int;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_telegramId_unique` UNIQUE(`telegramId`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_referralCode_unique` UNIQUE(`referralCode`);