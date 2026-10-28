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
GitHub Actions run 40668175103 passed on Linux, including lint, the production build and all eight Playwright tests.

## Current limitations
- Six fictional records held in memory
- Live API integration currently retrieves one fixed Met record; no database or CMS
- No AWS deployment
- Accessibility features have not undergone a full audit

## Development
Built with AI assistance as a practical learning project.


## Live museum integration
GET /api/met retrieves a real record from The Metropolitan Museum of Art.
The server validates and maps the response, with timeout and error handling.
The interface displays attribution and a link to the original record.

Ten Playwright tests passed locally. The two live-record interface tests
use mocked responses, keeping CI independent of the external service.
Server-side response validation is not yet covered by automated tests.

Intermittent upstream connection failures were observed locally;
their underlying cause remains unresolved.

## Additional verification
Nineteen automated tests passed locally:
- Eight collection interface and API tests
- Two live-record interface tests with mocked responses
- Seven backend tests with controlled upstream responses
- Keyboard navigation and mobile viewport checks

Production smoke checks passed for the homepage, collection filtering
and invalid-category rejection. Mobile coverage checks one viewport;
a full accessibility audit remains outstanding.
