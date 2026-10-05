CREATE TABLE `customer_order` (
	`id` text PRIMARY KEY NOT NULL,
	`qr_code_id` text NOT NULL,
	`user_id` text NOT NULL,
	`number` integer NOT NULL,
	`token` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`mode` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`address` text,
	`table_number` text,
	`note` text,
	`items` text NOT NULL,
	`subtotal` real NOT NULL,
	`delivery_fee` real DEFAULT 0 NOT NULL,
	`total` real NOT NULL,
	`currency` text NOT NULL,
	`sender_hash` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`qr_code_id`) REFERENCES `qr_code`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_order_token_unique` ON `customer_order` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `order_number_idx` ON `customer_order` (`qr_code_id`,`number`);--> statement-breakpoint
CREATE INDEX `order_user_created_idx` ON `customer_order` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `order_sender_idx` ON `customer_order` (`qr_code_id`,`sender_hash`,`created_at`);