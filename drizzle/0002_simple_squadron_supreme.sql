CREATE TABLE `app_users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`is_owner` integer DEFAULT 0 NOT NULL,
	`first_seen` text NOT NULL,
	`last_seen` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_users_last_seen_idx` ON `app_users` (`last_seen`);