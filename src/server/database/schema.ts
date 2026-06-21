// Re-export the interface and implementations for backwards compatibility
export type { IScreenshotRepository, RecordFilters } from "./IScreenshotRepository";
export { SqliteScreenshotRepository } from "./SqliteScreenshotRepository";
export { InMemoryScreenshotRepository } from "./InMemoryScreenshotRepository";

// Default export for production use
export { SqliteScreenshotRepository as ScreenshotRepository } from "./SqliteScreenshotRepository";