import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import type { ScreenshotAnalysis } from "../types/screenshot";
import type { IScreenshotRepository, RecordFilters } from "./IScreenshotRepository";

export class SqliteScreenshotRepository implements IScreenshotRepository {
  private readonly db: Database.Database;

  async findByHash(hash: string): Promise<ScreenshotAnalysis | null> {
  const stmt = this.db.prepare(
    "SELECT record_json FROM screenshot_records WHERE file_hash = ?"
  );

  const row = stmt.get(hash) as
    | { record_json: string }
    | undefined;

  return row
    ? (JSON.parse(row.record_json) as ScreenshotAnalysis)
    : null;
}

async findBySourceRef(
  sourceRef: string
): Promise<ScreenshotAnalysis | null> {
  const stmt = this.db.prepare(
    "SELECT record_json FROM screenshot_records WHERE source_ref = ?"
  );

  const row = stmt.get(sourceRef) as
    | { record_json: string }
    | undefined;

  return row
    ? (JSON.parse(row.record_json) as ScreenshotAnalysis)
    : null;
}

  constructor(dbPath: string = path.join(process.cwd(), "data", "screenshots.db")) {
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.migrate();
  }

  private migrate(): void {
  this.db.exec(`
    CREATE TABLE IF NOT EXISTS screenshot_records (
      id           TEXT PRIMARY KEY,
      source_type  TEXT NOT NULL,
      source_ref   TEXT,
      file_hash    TEXT,
      processed_at TEXT NOT NULL,
      record_json  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_source_type
      ON screenshot_records (source_type);

    CREATE INDEX IF NOT EXISTS idx_processed_at
      ON screenshot_records (processed_at);

    CREATE INDEX IF NOT EXISTS idx_source_ref
      ON screenshot_records (source_ref);

    CREATE INDEX IF NOT EXISTS idx_file_hash
      ON screenshot_records (file_hash);
  `);
}

  async save(record: ScreenshotAnalysis): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO screenshot_records (id, source_type, source_ref, processed_at, record_json)
      VALUES (@id, @sourceType, @sourceRef, @processedAt, @recordJson)
      ON CONFLICT(id) DO UPDATE SET
        source_type  = excluded.source_type,
        source_ref   = excluded.source_ref,
        processed_at = excluded.processed_at,
        record_json  = excluded.record_json
    `);

    stmt.run({
      id:          record.screenshot.id,
      sourceType:  record.screenshot.sourceType,
      sourceRef:   record.screenshot.sourceRef,
      processedAt: record.processedAt,
      recordJson:  JSON.stringify(record),
    });
  }

  async findById(id: string): Promise<ScreenshotAnalysis | null> {
    const stmt = this.db.prepare(
      "SELECT record_json FROM screenshot_records WHERE id = ?"
    );
    const row = stmt.get(id) as { record_json: string } | undefined;
    return row ? (JSON.parse(row.record_json) as ScreenshotAnalysis) : null;
  }

  async findAll(filters?: RecordFilters): Promise<ScreenshotAnalysis[]> {
    let query = "SELECT record_json FROM screenshot_records WHERE 1=1";
    const params: unknown[] = [];

    if (filters?.sourceType) {
      query += " AND source_type = ?";
      params.push(filters.sourceType);
    }
    if (filters?.fromDate) {
      query += " AND processed_at >= ?";
      params.push(filters.fromDate);
    }
    if (filters?.toDate) {
      query += " AND processed_at <= ?";
      params.push(filters.toDate);
    }

    query += " ORDER BY processed_at DESC";

    const rows = this.db.prepare(query).all(...params) as { record_json: string }[];
    let results = rows.map((r) => JSON.parse(r.record_json) as ScreenshotAnalysis);

    // Filter by tag in memory (tags are inside JSON)
    if (filters?.tag) {
      const tag = filters.tag.toLowerCase();
      results = results.filter((r) =>
        r.tagging.labels.some((l) => l.toLowerCase().includes(tag)) ||
        r.tagging.categories.some((c) => c.toLowerCase().includes(tag))
      );
    }

    return results;
  }

  async delete(id: string): Promise<void> {
    this.db.prepare("DELETE FROM screenshot_records WHERE id = ?").run(id);
  }

  close(): void {
    this.db.close();
  }
}