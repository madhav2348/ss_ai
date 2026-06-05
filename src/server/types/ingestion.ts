import { z } from "zod";

// ── Metadata sub-schemas ──────────────────────────────────────────────────────

export const LocalMetaSchema = z.object({
  originalFileName: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const CloudMetaSchema = z.object({
  originalFileName: z.string().optional(),
  description: z.string().optional(),
  mimeType: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const TelegramMetaSchema = z.object({
  originalFileName: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ── Per-source payload schemas ────────────────────────────────────────────────

export const LocalPayloadSchema = z.object({
  type: z.literal("local"),
  filePath: z.string().min(1, "filePath is required"),
  metadata: LocalMetaSchema.optional(),
});

export const CloudPayloadSchema = z.object({
  type: z.literal("cloud"),
  provider: z.literal("gdrive"),
  fileId: z.string().min(1, "fileId is required"),
  accessToken: z.string().min(1, "accessToken is required"),
  metadata: CloudMetaSchema.optional(),
});

export const TelegramPayloadSchema = z.object({
  type: z.literal("telegram"),
  fileId: z.string().min(1, "fileId is required"),
  botToken: z.string().min(1, "botToken is required"),
  caption: z.string().optional(),
  metadata: TelegramMetaSchema.optional(),
});

// ── Discriminated union ───────────────────────────────────────────────────────

export const ScreenshotPayloadSchema = z.discriminatedUnion("type", [
  LocalPayloadSchema,
  CloudPayloadSchema,
  TelegramPayloadSchema,
]);

// ── Inferred TypeScript types ─────────────────────────────────────────────────

export type LocalMeta = z.infer<typeof LocalMetaSchema>;
export type CloudMeta = z.infer<typeof CloudMetaSchema>;
export type TelegramMeta = z.infer<typeof TelegramMetaSchema>;

export type LocalPayload = z.infer<typeof LocalPayloadSchema>;
export type CloudPayload = z.infer<typeof CloudPayloadSchema>;
export type TelegramPayload = z.infer<typeof TelegramPayloadSchema>;
export type ScreenshotPayload = z.infer<typeof ScreenshotPayloadSchema>;
