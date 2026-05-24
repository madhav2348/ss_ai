# ss.ai Todo

Project state as of 2026-05-24: the root app is a Next.js 16.2.2 app with a client dashboard under `src/features/ss-app`, Next API routes under `src/app/api`, and a server-side screenshot pipeline scaffold under `src/server`. The app builds, type-checks, and has one lint warning.

## Current Status

- [x] Root Next app is wired through `src/app/[[...path]]/page.tsx`.
- [x] Dashboard shell exists with Cloud, Telegram, and Local screenshots sections.
- [x] Google Drive folder detection has a frontend-only metadata scan and demo fallback.
- [x] Local screenshot directory detection works in Chromium via `showDirectoryPicker`.
- [x] API routes exist for `/api/health`, `/api/screenshots`, and `/api/exports/xlsx`.
- [x] Screenshot processing pipeline shape exists: OCR, vision, source, tags, repository, vector index, processed JSON, export.
- [ ] Real ingestion is not wired into the API or UI yet.
- [ ] OCR, vision, source lookup, Redis, vector search, and XLSX export are placeholders.
- [ ] Repository state is in-memory, so processed records disappear across server restarts.

## Priority 0 - Correctness And Build Hygiene

- [ ] Replace the account avatar `<img>` in `DashboardLayout.tsx` with Next `Image` or explicitly justify/disable the lint rule.
- [ ] Add a root `.env.example` documenting `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `OPENAI_API_KEY`, `REDIS_URL`, `SCREENSHOT_STORAGE_DIR`, `PROCESSED_STORAGE_DIR`, `TELEGRAM_BOT_TOKEN`, and `PORT`.
- [ ] Decide whether `src/server/server/api.ts` is still needed now that Next API routes exist; remove it if it is legacy.
- [ ] Fix README legacy path references so they match the current repo. It mentions `frontend/`, `backend/`, and `mobile/`, but the visible placeholder is `mobile [soon]/`.
- [ ] Add at least one smoke test path or documented manual test for the dashboard and API routes.

## Priority 1 - Ingestion Flow

- [ ] Add an API route to submit a screenshot ingestion job, for example `POST /api/screenshots`.
- [ ] Define the accepted payload for local, cloud, and Telegram screenshot inputs.
- [ ] Store uploaded or discovered screenshot files under `storage/screenshots` instead of only accepting `filePath` strings.
- [ ] Connect the in-memory queue to the pipeline by processing enqueued jobs from an API route or a worker runtime.
- [ ] Add job states: queued, processing, processed, failed.
- [ ] Return job and record status to the dashboard.

## Priority 2 - Persistence

- [ ] Replace `ScreenshotRepository`'s in-memory `Map` with durable storage.
- [ ] Choose the first durable store: SQLite is likely enough for local-first development; Postgres is better if multi-device sync is needed soon.
- [ ] Add migrations or schema initialization for screenshot records, source metadata, tags, embeddings, and job status.
- [ ] Keep processed JSON export as an audit/debug artifact, but do not make it the only source of truth.
- [ ] Add duplicate detection using file hash, source ref, and original filename.

## Priority 3 - AI Pipeline

- [ ] Replace `PaddleOcrClient` placeholder output with a real OCR implementation.
- [ ] Replace `VisionAgent` placeholder output with actual image analysis.
- [ ] Add structured AI output validation before saving analysis records.
- [ ] Improve `SourceWorker` to extract URLs, app names, titles, comment text, and description evidence from OCR and metadata.
- [ ] Expand `TagWorker` beyond `unclassified` using deterministic rules first, then AI classification where needed.
- [ ] Track confidence and error details for each pipeline stage independently.

## Priority 4 - Search And Export

- [ ] Replace the in-memory `VectorIndex` array with a searchable vector store or database-backed embeddings table.
- [ ] Add `/api/search` for keyword and semantic search across OCR text, source evidence, labels, and categories.
- [ ] Add dashboard views for processed screenshots, search results, and record detail.
- [ ] Replace `XlsxExporter` CSV output with a real XLSX writer, or rename the route and class to CSV if CSV is intentional.
- [ ] Add export filters by date, source type, category, and confidence.

## Priority 5 - Integrations

- [ ] Google Drive: move from folder detection to file listing, change detection, and ingestion.
- [ ] Local device: persist a directory handle where possible and add manual refresh/import.
- [ ] Telegram: implement bot webhook or polling, media download, description/comment capture, and job enqueueing.
- [ ] Cloud providers: define whether Dropbox, OneDrive, and iCloud are planned for MVP or should stay disabled.
- [ ] Add provider-specific source refs that can round-trip back to the original file/message/folder.

## Priority 6 - UI Product Work

- [ ] Add a processed screenshots table or grid in the dashboard.
- [ ] Add empty, loading, error, and success states for each dashboard section.
- [ ] Show ingestion progress and failed jobs with retry actions.
- [ ] Add record detail view with screenshot preview, OCR text, vision summary, source evidence, and tags.
- [ ] Add settings for storage paths, provider connections, and AI provider keys.
- [ ] Review nested card styling in `DashboardLayout.tsx` and `app.css`; the current dashboard uses `content-card` as a broad wrapper.

## Priority 7 - Security And Privacy

- [ ] Avoid storing Google OAuth access tokens in `localStorage` for production.
- [ ] Move OAuth token handling to a backend-controlled flow if this becomes more than a local demo.
- [ ] Add file type and size validation before accepting screenshots.
- [ ] Keep private screenshots out of git and document storage backup expectations.
- [ ] Add clear deletion/export controls for user-owned screenshot data.

## Priority 8 - Testing

- [ ] Add unit tests for `SourceWorker`, `TagWorker`, directory detection confidence, and CSV/XLSX escaping.
- [ ] Add integration tests for API routes with a temporary storage directory.
- [ ] Add pipeline tests covering successful processing and stage failure handling.
- [ ] Add UI tests for routing, sign-in demo mode, Drive detection demo mode, and local directory unsupported state.
- [ ] Add CI commands for `npm run lint`, `npm run backend:check`, and `npm run build`.

## Verification Run

- [x] `npm run lint` passes with 1 warning: `@next/next/no-img-element` in `src/features/ss-app/components/layout/DashboardLayout.tsx`.
- [x] `npm run backend:check` passes.
- [x] `npm run build` passes.

