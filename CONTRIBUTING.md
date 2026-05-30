# Contributing

Thanks for helping improve SS AI. This project is a Next.js app for screenshot ingestion, OCR, AI analysis, tagging, and export workflows.

## Prerequisites

- Node.js 20 or newer
- npm
- Redis, when working on queue or worker behavior that needs a real Redis instance

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Fill in only the values needed for the area you are working on. Do not commit `.env` or real credentials.

4. Start the development server:

   ```bash
   npm run dev
   ```

## Useful Commands

Run these from the repository root:

```bash
npm run dev
npm run lint
npm run backend:check
npm run build
```

- `npm run dev` starts the local Next.js development server.
- `npm run lint` runs ESLint.
- `npm run backend:check` runs TypeScript type checking without emitting files.
- `npm run build` verifies the production build.

## Project Structure

- `src/app/` contains Next.js routes, layouts, and API route handlers.
- `src/features/` contains frontend feature modules.
- `src/server/` contains server runtime, ingestion, queue, worker, AI, storage, and export code.
- `public/` contains static assets.
- `storage/` is for local app storage and generated data.
- `mobile [soon]/` is a placeholder for future mobile work.

## Development Guidelines

- Keep changes scoped to the feature or bug being addressed.
- Follow the existing TypeScript, React, and CSS patterns in nearby files.
- Prefer small, readable modules over broad rewrites.
- Keep secrets and generated local files out of commits.
- Update documentation when behavior, setup, scripts, or architecture changes.
- For Next.js-specific code, check the installed documentation under `node_modules/next/dist/docs/` before using APIs or conventions.

## Testing and Verification

Before opening a pull request, run the checks that match your change:

```bash
npm run lint
npm run backend:check
npm run build
```

For UI changes, also run the app locally and verify the affected flow in the browser.
For API, worker, ingestion, queue, or storage changes, include a short note in the pull request describing how the path was verified.

## Branch and Commit Workflow

1. Branch from `develop`:

   ```bash
   git checkout develop
   git pull
   git checkout -b docs/contributing
   ```

2. Make the change and commit it:

   ```bash
   git add CONTRIBUTING.md
   git commit -m "docs: add contribution guide"
   ```

3. Push the branch and open a pull request into `develop`.

## Pull Request Checklist

Before requesting review, confirm that:

- The PR targets `develop`.
- The description explains what changed and why.
- Relevant checks have been run and their results are listed.
- New setup steps, environment variables, or scripts are documented.
- Screenshots or screen recordings are included for meaningful UI changes.
- The PR does not include secrets, local storage data, or unrelated changes.

