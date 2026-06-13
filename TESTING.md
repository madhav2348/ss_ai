# Manual Testing Guide

## Prerequisites

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application should be available at:

http://localhost:3000

---

## Dashboard Test

### Objective

Verify that the dashboard loads correctly.

### Steps

1. Open http://localhost:3000
2. Wait for the page to load.
3. Verify all dashboard sections are visible.

### Expected Result

- Dashboard opens successfully.
- No crash or blank page.
- All sections render correctly.

---

## Health API Test

### Endpoint

GET /api/health

### Steps

1. Open browser.
2. Visit:

http://localhost:3000/api/health

### Expected Result

Status Code:

200 OK

Response:

```json
{
  "ok": true
}
```

---

## Screenshots API Test

### Endpoint

GET /api/screenshots

### Steps

1. Open browser.
2. Visit:

http://localhost:3000/api/screenshots

### Expected Result

Status Code:

200 OK

Response should be a valid JSON array.

Example:

```json
[]
```

---

## Export API Test

### Endpoint

GET /api/exports/xlsx

### Steps

1. Open browser.
2. Visit:

http://localhost:3000/api/exports/xlsx

### Expected Result

- File download starts automatically.
- Response status is 200.
- Export file is generated successfully.

---

## Regression Checklist

- Dashboard loads.
- Health endpoint returns 200.
- Screenshots endpoint returns JSON.
- Export endpoint downloads a file.
- No console errors.