# SS.AI — API Reference

## POST /api/screenshots

Ingests a screenshot from one of three sources: **local upload**, **Google Drive**, or **Telegram**.

The accepted content-type and payload shape depend on the source type.

---

### Local file upload

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | `File` | Yes | The screenshot binary |
| `type` | `"local"` | No (default) | Source type |
| `sourceRef` | `string` | No | Custom reference label |
| `originalFileName` | `string` | No | Override the stored file name |
| `description` | `string` | No | Human-readable note |

**Example:**
```
POST /api/screenshots
Content-Type: multipart/form-data

file=<binary>
type=local
description=Homepage screenshot
```

---

### Google Drive

**Content-Type:** `application/json`

```ts
{
  type: "cloud";
  provider: "gdrive";
  fileId: string;        // Google Drive file ID
  accessToken: string;   // OAuth2 access token
  metadata?: {
    originalFileName?: string;
    description?: string;
    mimeType?: string;
    tags?: string[];
  };
}
```

**Example:**
```json
{
  "type": "cloud",
  "provider": "gdrive",
  "fileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
  "accessToken": "ya29.a0AfH6...",
  "metadata": {
    "description": "Q3 dashboard screenshot"
  }
}
```

---

### Telegram

**Content-Type:** `application/json`

```ts
{
  type: "telegram";
  fileId: string;       // Telegram file_id from the Bot API
  botToken: string;     // Telegram bot token
  caption?: string;     // Optional message caption
  metadata?: {
    originalFileName?: string;
    description?: string;
    tags?: string[];
  };
}
```

**Example:**
```json
{
  "type": "telegram",
  "fileId": "BQACAgIAAxkBAAIBtWR...",
  "botToken": "123456:ABC-DEF1234",
  "caption": "Error screenshot from production"
}
```

---

### Responses

| Status | Meaning |
|---|---|
| `202 Accepted` | Job queued successfully. Returns `{ jobId, status: "queued" }` |
| `400 Bad Request` | Invalid payload. Returns `{ error, issues[] }` with field-level detail |
| `415 Unsupported Media Type` | Content-type not supported |
| `500 Internal Server Error` | Unexpected server error |

**Success response:**
```json
{
  "jobId": "3f6a1b2c-...",
  "status": "queued"
}
```

**Validation error response:**
```json
{
  "error": "Invalid payload",
  "issues": [
    { "code": "invalid_type", "path": ["fileId"], "message": "Required" }
  ]
}
```

---

### Types (shared source of truth)

All payload types and Zod schemas are exported from `src/server/types/ingestion.ts`:

```ts
import {
  ScreenshotPayloadSchema,
  LocalPayloadSchema,
  CloudPayloadSchema,
  TelegramPayloadSchema,
  type ScreenshotPayload,
  type LocalPayload,
  type CloudPayload,
  type TelegramPayload,
} from "@/server/types/ingestion";
```
