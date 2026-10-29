import { connection } from "next/server";

export async function GET() {
  await connection();

  const space = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_DELIVERY_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

  if (!space || !token) {
    return Response.json(
      { error: "The cloud CMS is not configured." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${encodeURIComponent(space)}/environments/${encodeURIComponent(environment)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `{
            museumObjectCollection(limit: 20) {
              items {
                sys { id }
                title
                description
                category
                year
              }
            }
          }`,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      },
    );

    if (!response.ok) {
      return Response.json(
        { error: "The cloud CMS is unavailable. Please retry." },
        { status: 502 },
      );
    }

    const body = await response.json();
    const records = body?.data?.museumObjectCollection?.items;

    if (body.errors?.length || !Array.isArray(records)) {
      return Response.json(
        { error: "The cloud CMS returned an unexpected response." },
        { status: 502 },
      );
    }

    const valid = records.every(
      (item: unknown) => {
        if (typeof item !== "object" || item === null) return false;
        const record = item as Record<string, unknown>;
        const sys = record.sys;
        return (
          typeof sys === "object" &&
          sys !== null &&
          typeof (sys as Record<string, unknown>).id === "string" &&
          typeof record.title === "string" &&
          record.title.trim().length > 0 &&
          ["description", "category"].every(
            (key) => record[key] == null || typeof record[key] === "string",
          ) &&
          (record.year == null || Number.isInteger(record.year))
        );
      },
    );

    if (!valid) {
      return Response.json(
        { error: "The cloud CMS returned invalid records." },
        { status: 502 },
      );
    }

    return Response.json(
      {
        items: records.map((record) => ({
          id: record.sys.id,
          title: record.title,
          description: record.description ?? "",
          category: record.category ?? "Uncategorised",
          year: record.year ?? null,
        })),
        source: "Contentful SaaS CMS via GraphQL",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      ["TimeoutError", "AbortError"].includes(error.name);

    return Response.json(
      {
        error: timedOut
          ? "The cloud CMS took too long to respond. Please retry."
          : "Could not retrieve cloud CMS records. Please retry.",
      },
      { status: timedOut ? 504 : 502 },
    );
  }
}
