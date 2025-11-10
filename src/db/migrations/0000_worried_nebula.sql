CREATE TABLE `clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`link_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`referer` text,
	`country` text,
	`city` text,
	`device_type` text,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `link_id_idx` ON `clicks` (`link_id`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `clicks` (`timestamp`);--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`short_code` text NOT NULL,
	`original_url` text NOT NULL,
	`user_id` text,
	`clicks` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `links_short_code_unique` ON `links` (`short_code`);--> statement-breakpoint
CREATE INDEX `short_code_idx` ON `links` (`short_code`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `links` (`user_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `links` (`created_at`);--> statement-breakpoint
CREATE INDEX `clicks_idx` ON `links` (`clicks`);