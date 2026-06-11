CREATE TABLE `screenshot_records` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`source_ref` text NOT NULL,
	`processed_at` text NOT NULL,
	`record_json` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_source_type` ON `screenshot_records` (`source_type`);--> statement-breakpoint
CREATE INDEX `idx_processed_at` ON `screenshot_records` (`processed_at`);