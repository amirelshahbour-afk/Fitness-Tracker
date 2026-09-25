CREATE TABLE `health_daily` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`day` text NOT NULL,
	`metric` text NOT NULL,
	`payload` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `health_daily_scope_day_idx` ON `health_daily` (`scope`,`day`);--> statement-breakpoint
CREATE TABLE `health_links` (
	`scope` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`last_received` text,
	`rate_start` integer DEFAULT 0 NOT NULL,
	`rate_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `health_links_token_hash_unique` ON `health_links` (`token_hash`);