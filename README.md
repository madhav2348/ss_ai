<div align="center">
<img src="public/logo.png" width="140" alt="GitNest Logo"/>
</div>

<p align="center">
  <strong>AI-powered screenshot analysis and knowledge extraction platform that processes screenshots from multiple sources using OCR, Vision AI, metadata enrichment, tagging, and parallel worker pipelines..</strong>
</p>

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
## Testing

See TESTING.md for manual testing instructions.

## Commit Linting with Husky and Conventional Commits

To maintain a clean and consistent commit history, this repository enforces the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/) using [Husky](https://typicode.github.io/husky/) and [Commitlint](https://commitlint.js.org/). This ensures that all commit messages adhere to a standardized format, making it easier to understand project changes, automate changelog generation, and improve overall project maintainability.

### Conventional Commits Structure

Each commit message should follow the format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Allowed Commit Types

Here are the primary commit types supported in this repository:

| Type     | Description                                                               |
| :------- | :------------------------------------------------------------------------ |
| `feat`   | A new feature                                                             |
| `fix`    | A bug fix                                                                 |
| `docs`   | Documentation only changes                                                |
| `chore`  | Routine tasks, maintenance, or tooling changes                            |
| `style`  | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.) |
| `refactor` | A code change that neither fixes a bug nor adds a feature                 |
| `perf`   | A code change that improves performance                                   |
| `test`   | Adding missing tests or correcting existing tests                         |
| `build`  | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm) |
| `ci`     | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |
| `revert` | Reverts a previous commit                                                 |

#### Example Commit Messages

*   **Valid Commit Messages:**
    ```
    feat: add user authentication module
    fix(auth): resolve login redirect issue
    docs: update README with installation steps
    chore: update dependencies
    ```

*   **Invalid Commit Messages (will be rejected):**
    ```
    updated stuff
    random changes
    ```

### How Husky Works

Husky is a Git hooks manager that allows you to easily configure scripts to run at various stages of your Git workflow. In this repository, Husky is used to trigger Commitlint before a commit message is saved (`commit-msg` hook).

When you attempt to commit, Husky will:

1.  Intercept the `commit-msg` Git hook.
2.  Execute Commitlint, which validates your commit message against the Conventional Commits specification.
3.  If the commit message is valid, the commit proceeds as usual.
4.  If the commit message is invalid, Commitlint will provide an error message, and the commit will be aborted, preventing non-compliant messages from entering the repository history.

This setup ensures that all contributions adhere to the defined commit standards automatically.
