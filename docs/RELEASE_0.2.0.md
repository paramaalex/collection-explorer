# Local release verification: 0.2.0

- All 23 automated tests passed before the version change.
- Production build completed and was started with npm run start.
- Production health endpoint reported version 0.2.0.
- Health and collection smoke checks passed; monitor exit code was 0.
- Controlled development-server outage returned 0/2 checks and exit code 1.
- Restart restored 2/2 checks and exit code 0.

These are local checks, not evidence of hosted production uptime.
Strapi and the Met API are not included in the monitoring script.
