import { connection } from "next/server";

type CmsRecord = {
  documentId: string;
  title: string;
  description: string | null;
  category: string | null;
  year: number | null;
};

function isRecord(value: unknown): value is CmsRecord {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.documentId === "string" &&
    typeof item.title === "string" &&
    (item.description === null || typeof item.description === "string") &&
    (item.category === null || typeof item.category === "string") &&
    (item.year === null ||
      (typeof item.year === "number" && Number.isInteger(item.year)))
  );
}

export async function GET() {
  await connection();

  try {
    const response = await fetch("http://127.0.0.1:1337/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query {
          museumObjects(pagination: { limit: 20 }) {
            documentId
            title
            description
            category
            year
          }
        }`,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`CMS returned HTTP ${response.status}`);
    }

    const result = await response.json();

    // GraphQL can return errors even when HTTP status is 200.
    if (result.errors?.length) {
      throw new Error("CMS returned GraphQL errors");
    }

    const records: unknown = result.data?.museumObjects;
    if (!Array.isArray(records) || !records.every(isRecord)) {
      throw new Error("CMS returned an unexpected record format");
    }

    return Response.json({
      items: records.map((item) => ({
        id: item.documentId,
        title: item.title,
        description: item.description ?? "",
        category: item.category ?? "Uncategorised",
        year: item.year,
      })),
      source: "Local Strapi CMS via GraphQL",
    });
  } catch (error) {
    console.error(
      "CMS request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return Response.json(
      { error: "Could not load CMS records. Check that Strapi is running." },
      { status: 502 },
    );
  }
}
