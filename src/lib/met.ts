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
    Number.isInteger(item.objectID) &&
    item.objectID > 0 &&
    typeof item.title === "string" &&
    item.title.trim().length > 0 &&
    ["artistDisplayName", "objectDate", "department", "objectURL"].every(
      (key) => item[key] === undefined || typeof item[key] === "string",
    )
  );
}

export async function getMuseumResponse(
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  try {
    const response = await fetcher(
      "https://collectionapi.metmuseum.org/public/collection/v1/objects/436535",
      {
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      },
    );

    if (!response.ok) {
      return Response.json(
        { error: "The museum service is unavailable. Please retry." },
        { status: 502 },
      );
    }

    let object: unknown;
    try {
      object = await response.json();
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      return Response.json(
        { error: "The museum returned invalid JSON." },
        { status: 502 },
      );
    }

    if (!isMetObject(object)) {
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

    console.error("Met API request failed:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      cause: error instanceof Error ? error.cause : undefined,
    });

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
