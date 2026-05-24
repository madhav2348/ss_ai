# SS AI
A personal AI for screenshot analysis and metadata extraction.

## Main app
The main app now lives at the repository root with Next.js routes under `src/app` and feature/server code under `src/features` and `src/server`.

Run the app from the repository root:

```bash
npm run dev
```

Useful root scripts:

```bash
npm run build
npm run lint
```

## Repository structure
- `src/app/` - main Next.js routes, layouts, and API route handlers.
- `src/features/` - UI feature modules.
- `src/server/` - server-side screenshot pipeline and API runtime.
- `public/` - static assets.
- `storage/` - local app storage.
- `mobile/` - [ soon ] mobile placeholder, retained for reference.

## Current foundation
- TypeScript backend scaffold aligned to the architecture below
- Ingestion stubs for Telegram, local device watcher, and cloud watcher
- In-memory queue for early development, plus Redis client placeholder
- Screenshot processing pipeline for OCR, vision analysis, source lookup, and tagging
- Target worker pool model where multiple workers process different screenshots in parallel
- Repository, processed JSON storage, vector index stub, and CSV-style XLSX export placeholder
- Minimal HTTP API with `/health`, `/screenshots`, and `/exports/xlsx`


### Feature
- connects to cloud storage and automatically processes new screenshots.
- Automatic Screenshot Detection in phones store
- mentioned the source is often in description or comments, the agent should collect metadata.


#### Architecture
```

                +----------------------+
                |     Screenshot       |
                |      Sources         |
                +----------+-----------+
                           |
        --------------------------------------------
        |                  |                       |
+---------------+  +---------------+      +---------------+
| Telegram Bot  |  | Local Watcher |      | Cloud Storage |
| (Send images) |  | (Device SS)   |      | (Drive/S3)    |
+-------+-------+  +-------+-------+      +-------+-------+
        |                  |                      |
        +------------------+----------------------+
                           |
                    +------+------+
                    | Ingestion   |
                    |   Service   |
                    +------+------+
                           |
                           v
                     +-----------+
                     |   Queue   |
                     | (Redis)   |
                     +-----------+
                           |
                     Worker Pool
                           |
         ---------------------------------------
         |           |           |             |
   +-----------+ +-----------+ +-----------+ +-----------+
   | OCR Agent | | Vision AI | | Source    | | Tagging   |
   |           | | Analysis  | | Finder    | | Agent     |
   +-----------+ +-----------+ +-----------+ +-----------+
                           |
                           v
                    +------------+
                    | Structured |
                    | Database   |
                    +------------+
                           |
            ---------------------------------
            |               |               |
       +--------+      +---------+      +---------+
       | XLSX   |      | JSON DB |      | Vector  |
       | Export |      | Storage |      | Search  |
       +--------+      +---------+      +---------+

```

#### Multi-worker processing model

The worker pool is meant to speed up batches by processing multiple screenshots at the same time.
For example, with 5 workers and 20 screenshots, up to 5 screenshots can be processed in parallel.
Each worker owns one screenshot job at a time and runs the full analysis pipeline for that screenshot:

```
Screenshot Queue
      |
      v
+------------+   +------------+   +------------+   +------------+   +------------+
| Worker 1   |   | Worker 2   |   | Worker 3   |   | Worker 4   |   | Worker 5   |
| Screenshot |   | Screenshot |   | Screenshot |   | Screenshot |   | Screenshot |
| Job A      |   | Job B      |   | Job C      |   | Job D      |   | Job E      |
+------------+   +------------+   +------------+   +------------+   +------------+
      |                |                |                |                |
      v                v                v                v                v
 OCR -> Vision AI -> Source Search -> Tags -> Store processed result
```

This means more workers can increase throughput when there are many screenshots waiting.
It does not mean one screenshot is split across 5 workers. One screenshot still moves through
OCR, AI analysis, source search, tagging, and storage as a single job.

Current implementation note: the repository has the pipeline classes and an in-memory queue scaffold.
The configurable parallel worker pool and Redis-backed processing are still target architecture work.

#### Worker stages
```
Queue (Redis)
     |
     v
+----------------------+
| Worker picks one job |
+----------------------+
     |
     v
+----------------------+
| OCR                  |
+----------------------+
     |
     v
+----------------------+
| Vision AI            |
+----------------------+
     |
     v
+----------------------+
| Source Search        |
+----------------------+
     |
     v
+----------------------+
| Tagging              |
+----------------------+
     |
     v
+----------------------+
| JSON / DB / XLSX     |
+----------------------+

```
#### Flow
```
Screenshot Added
      |
      v
Queue Job Created
      |
      v
Worker Picks Job
      |
      v
+----------------------+
| Step 1: OCR Extract  |
| Text from Screenshot |
+----------------------+
      |
      v
+----------------------+
| Step 2: Vision AI    |
| Scene understanding  |
+----------------------+
      |
      v
+----------------------+
| Step 3: Source Agent |
| Find reference link  |
+----------------------+
      |
      v
+----------------------+
| Step 4: Categorize   |
| anime/movie/meme     |
+----------------------+
      |
      v
+----------------------+
| Step 5: Store Data   |
| JSON / DB / XLSX     |
+----------------------+
```


#### Structure 
> Will improve/Change in future
```
ai-screenshot-agent
│
├── services
│   ├── ingestion
│   │   ├── telegram
│   │   │   └── bot.ts
│   │   ├── cloud
│   │   │   └── watcher.ts
│   │   └── local
│   │       └── deviceWatcher.ts
│   │
│   ├── queue
│   │   ├── queue.ts
│   │   └── redis.ts
│   │
│   ├── workers
│   │   ├── ocrWorker.ts
│   │   ├── visionWorker.ts
│   │   ├── sourceWorker.ts
│   │   └── tagWorker.ts
│   │
│   ├── ai
│   │   ├── ocr
│   │   │   └── paddle.ts
│   │   ├── vision
│   │   │   └── visionAgent.ts
│   │   └── embeddings
│   │       └── vector.ts
│
├── storage
│   ├── screenshots
│   └── processed
│
├── database
│   └── schema.ts
│
├── exports
│   └── xlsxExporter.ts
│
└── server
    └── api.ts
```
