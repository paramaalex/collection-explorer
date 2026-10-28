# Troubleshooting Collection Explorer

## Start the application
From the project directory:
npm ci
npm run dev

Open the Local URL printed by Next.js.

## Port 3000 already in use
Check the existing server and its project directory before stopping it.
Use Ctrl+C in its terminal, then restart with npm run dev.
Do not stop unrelated Node processes.

## API route returns 404
Confirm the route file exists under src/app/api.
Confirm the running server belongs to this project.
Restart the development server and retry the endpoint.

## Live museum record fails
The browser calls /api/met. This route calls the Met collection API.

- HTTP 502: upstream HTTP failure, invalid response or connection failure.
- HTTP 504: the server-side request exceeded its 30-second timeout.
- Inspect the server log for the underlying error.
- Compare a direct Node fetch with the application endpoint.
- Retry using the interface button.
- Do not disable TLS certificate verification.

### Investigation recorded during development
PowerShell and direct Node requests successfully retrieved the record.
The Next.js route intermittently returned connection failures or timeouts.
Successful responses and UI display were subsequently observed.
The underlying network cause remains unresolved; the longer timeout is
not evidence of a root-cause fix.

### Separate build issue
The route caught a Next.js prerender cancellation and logged it as an
upstream failure. Adding await connection() outside the try/catch made
request-time execution explicit. Lint and production build then passed
without that prerender error.

## Verify a change
npm run lint
npm run build
npm run test:e2e

Ten tests passed locally and in GitHub Actions at the integration milestone.
Live-record UI tests mock /api/met; they do not prove external availability
or test the server-side response validator.

## Known limitations
- Search uses six fictional records.
- The live integration retrieves one fixed Met record.
- No database, CMS or AWS deployment.
- Accessibility has not undergone a full audit.
