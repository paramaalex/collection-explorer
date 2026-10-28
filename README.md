# Collection Explorer

An independent learning and portfolio project built with Next.js,
React and TypeScript. Uses fictional museum collection records.
Not affiliated with Te Papa.

## Features
- Search by title and category
- REST endpoint with input validation
- Expandable object details
- Labelled controls and status/error announcements
- Loading, empty and error states
- Retry after a failed request

## Run locally
npm ci
npm run dev

Open http://localhost:3000.

## Checks
npm run lint
npm run build
npx playwright install --no-shell chromium
npm run test:e2e

Playwright uses the chromium channel. Eight tests cover search,
category filtering, details, empty results, error recovery and API
validation. All eight passed locally on Windows.

## API
GET /api/collection?q=landscape&category=Art

Returns items, total and source. Unsupported categories and searches
over 100 characters return HTTP 400.

## Continuous integration
GitHub Actions is configured to run lint, the production build and
Playwright tests, and upload the HTML report.
The hosted workflow has not yet been verified.

## Current limitations
- Six fictional records held in memory
- No external collection API, database or CMS
- No AWS deployment
- Accessibility features have not undergone a full audit

## Development
Built with AI assistance as a practical learning project.
