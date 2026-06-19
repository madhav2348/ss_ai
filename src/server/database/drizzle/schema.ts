import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const screenshotRecords = sqliteTable(
  "screenshot_records",
  {
    id: text("id").primaryKey(),

    sourceType: text("source_type").notNull(),

    sourceRef: text("source_ref").notNull(),

    processedAt: text("processed_at").notNull(),

    recordJson: text("record_json").notNull(),
  },
  (table) => ({
    sourceTypeIdx: index("idx_source_type").on(table.sourceType),

    processedAtIdx: index("idx_processed_at").on(table.processedAt),
  })
);