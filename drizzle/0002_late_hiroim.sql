CREATE TABLE `wishlist_reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`wishlistItemId` int NOT NULL,
	`reservedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlist_reservations_id` PRIMARY KEY(`id`)
);
