import { connection } from "next/server";

type MetObject = {
  objectID: number;
  title: string;
  artistDisplayName?: string;
  objectDate?: string;
  department?: string;
  objectURL?: string;
};

function isMetObject(value: unknown): value is MetObject {
  if (typeof value !== "object" || value === null) return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.objectID === "number" &&
    typeof item.title === "string" &&
    ["artistDisplayName", "objectDate", "department", "objectURL"].every(
      (key) => item[key] === undefined || typeof item[key] === "string",
    )
  );
}

export async function GET() {
  await connection();
  try {
    const response = await fetch(
      "https://collectionapi.metmuseum.org/public/collection/v1/objects/436535",
      {
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      },
    );

    if (!response.ok) {
      console.error("Met API returned HTTP", response.status);
      return Response.json(
        { error: "The museum service is unavailable. Please retry." },
        { status: 502 },
      );
    }

    const object: unknown = await response.json();

    if (!isMetObject(object)) {
      console.error("Met API returned an unexpected record format");
      return Response.json(
        { error: "The museum returned an unexpected record format." },
        { status: 502 },
      );
    }

    return Response.json({
      item: {
        id: String(object.objectID),
        title: object.title,
        artist: object.artistDisplayName || "Artist not recorded",
        date: object.objectDate || "Date not recorded",
        category: object.department || "Uncategorised",
        sourceUrl: object.objectURL || null,
      },
      source: "The Metropolitan Museum of Art",
    });
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    console.error(
      "Met API request failed:", JSON.stringify(error instanceof Error ? { name: error.name, message: error.message, cause: error.cause } : { error }), JSON.stringify(error instanceof Error ? { name: error.name, message: error.message, cause: error.cause } : { error }),
      error,
    );

    return Response.json(
      {
        error: timedOut
          ? "The museum service took too long to respond. Please retry."
          : "Could not connect to the museum service. Please retry.",
      },
      { status: timedOut ? 504 : 502 },
    );
  }
}





