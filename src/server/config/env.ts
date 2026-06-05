import path from "node:path";

function readNumber(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: readNumber("PORT", 3000),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  screenshotStorageDir: process.env.SCREENSHOT_STORAGE_DIR
    ? path.resolve(process.env.SCREENSHOT_STORAGE_DIR)
    : path.join(/* turbopackIgnore: true */ process.cwd(), "storage", "screenshots"),
  processedStorageDir: process.env.PROCESSED_STORAGE_DIR
    ? path.resolve(process.env.PROCESSED_STORAGE_DIR)
    : path.join(/* turbopackIgnore: true */ process.cwd(), "storage", "processed"),
};