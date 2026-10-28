# Local CMS and GraphQL setup

## Components
- Explorer: Next.js, localhost:3000
- CMS: Strapi Community 5.60.0, localhost:1337
- GraphQL plugin: @strapi/plugin-graphql 5.60.0
- Database: local SQLite

## Recreate the CMS
In a separate directory:
npx create-strapi@5.60.0 collection-cms --skip-cloud --use-npm

Choose SQLite and TypeScript, then install dependencies.
Inside collection-cms:
npm install @strapi/plugin-graphql@5.60.0
npm run develop

Create a local administrator account.

If npm blocks the SQLite installer:
npm install-scripts approve better-sqlite3
npm rebuild better-sqlite3 --foreground-scripts

## Content model
Create a Museum Object collection type:
- Singular API ID: museum-object
- Plural API ID: museum-objects
- title: required short text
- description: optional long text
- category: optional short text
- year: optional integer
- Draft and Publish enabled

The exact schema is saved in museum-object.schema.json.

## Content and permissions
Create and publish a fictional demonstration record.
Under Users & Permissions > Roles > Public, enable only
Museum Object find and findOne. Do not grant write permissions.

## GraphQL query
POST http://localhost:1337/graphql
Content-Type: application/json

{
  "query": "query { museumObjects(pagination: { limit: 20 }) { documentId title description category year } }"
}

## Application flow
The browser calls GET /api/cms.
Next.js posts a GraphQL query to http://127.0.0.1:1337/graphql.
It checks HTTP errors, GraphQL errors and record structure,
then maps the records for the interface.

## Manual verification
A record was edited and republished in Strapi.
Reloading CMS records in the explorer displayed the changed description
without changing the Next.js application code.

## Automated coverage
Three CMS interface tests cover content display, empty results and retry.
They mock /api/cms and do not exercise the live Strapi server.
The complete local suite passed 22 tests.

## Limitations
This is a local learning setup with a fixed CMS address and 20-record limit.
Strapi dependency audit findings require review before deployment.
The CMS database, administrator credentials and permissions are not
included in the explorer repository.
