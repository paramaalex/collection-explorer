# Local rollback rehearsal

## Procedure
1. Created an isolated Git worktree from tag v0.2.0.
2. Changed the rehearsal package version to 0.2.1.
3. Built and started the production server on port 3003.
4. Confirmed /api/health reported 0.2.1.
5. Stopped the server and restored package files from v0.2.0.
6. Reinstalled dependencies, rebuilt and restarted on port 3003.

## Verified result
- Health endpoint reported version 0.2.0.
- Health check: HTTP 200, 55 ms.
- Collection check: HTTP 200, 18 ms.
- Monitor: 2/2 passed, exit code 0.
- Rehearsal worktree was clean.

## Issues encountered
npm ci initially failed because a native Next.js file was locked.
Stopping the rehearsal server allowed installation to complete.
A start attempt failed with a missing build file; rebuilding successfully
restored the required production output before restarting.

## Scope
This was a local version rollback exercise. Versions differed only in
package metadata. It did not test a functional regression, database
migration rollback, hosted deployment or zero-downtime recovery.
