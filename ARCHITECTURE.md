# Architecture Documentation

## Database Engine Decision: SQLite

For local-first development of the **ss_ai** platform, SQLite is selected as the primary database engine.

### Rationale

1. **Zero External Infrastructure**: SQLite runs out of the box with zero external configuration or database servers to manage. This offers a frictionless setup experience for local development.
2. **Local-First Alignment**: Since screenshots are processed and stored locally on the user's filesystem (under `./storage/`), storing metadata in a local SQLite file (`storage/db/ss.db`) is highly aligned.
3. **Low Resource Footprint**: Running a native client like `better-sqlite3` is highly efficient, avoiding socket communication overhead.
4. **Rich Features**: SQLite supports all necessary query features including JSON operations, index creation, full-text search, and hash deduplication.

---

## PostgreSQL Upgrade Path

When building features such as **multi-device sync**, cloud backups, or deploying a multi-tenant web application, migrating to a centralized database like PostgreSQL is the recommended upgrade path.

### Step-by-Step Migration Plan

#### 1. Abstracting Database Queries
Ensure all database logic remains inside implementation classes of the [IScreenshotRepository](file:///c:/Users/Onkar%20Gite/Desktop/Opensorce/ss_ai/src/server/database/IScreenshotRepository.ts) interface. This keeps database dialects decoupled from business logic.

#### 2. Introduce the Postgres Client
Install pg-driver dependencies (e.g., `pg` or `postgres`, or an ORM like Drizzle / Prisma):
```bash
npm install pg @types/pg
```

#### 3. Update Environment Configuration
Extend [env.ts](file:///c:/Users/Onkar%20Gite/Desktop/Opensorce/ss_ai/src/server/config/env.ts) to read `DATABASE_URL` (e.g. `postgresql://user:password@localhost:5432/ss_ai`).

#### 4. Implement Postgres Repository
Create `PostgresScreenshotRepository` implementing `IScreenshotRepository`:
* Adapt SQL queries to PostgreSQL dialect (e.g. replacing SQLite JSON queries with Postgres JSONB operators like `->>` or `@>`).
* Replace SQLite's `INSERT OR REPLACE` / `ON CONFLICT` statements with Postgres `INSERT ... ON CONFLICT (id) DO UPDATE ...`.

#### 5. Data Migration
Create a one-time migration script that:
1. Instantiates `SqliteScreenshotRepository` to read all existing rows from `storage/db/ss.db`.
2. Instantiates `PostgresScreenshotRepository` to batch insert them into the new Postgres database.

#### 6. Switch the Shared Runtime Instance
Update [schema.ts](file:///c:/Users/Onkar%20Gite/Desktop/Opensorce/ss_ai/src/server/database/schema.ts) to export `PostgresScreenshotRepository` as the default `ScreenshotRepository` based on the environment variables.
