import { test, expect } from "@playwright/test";
import { getMuseumResponse } from "../src/lib/met";

const record = {
  objectID: 436535,
  title: "Wheat Field with Cypresses",
  artistDisplayName: "Vincent van Gogh",
  objectDate: "1889",
  department: "European Paintings",
  objectURL: "https://www.metmuseum.org/art/collection/search/436535",
};

test("backend maps and attributes a valid upstream record", async () => {
  const fakeFetch: typeof fetch = async (input, options) => {
    expect(String(input)).toBe(
      "https://collectionapi.metmuseum.org/public/collection/v1/objects/436535",
    );
    expect(options?.signal).toBeDefined();
    expect(options?.cache).toBe("no-store");
    return Response.json(record);
  };

  const response = await getMuseumResponse(fakeFetch);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    item: {
      id: "436535",
      title: record.title,
      artist: record.artistDisplayName,
      date: "1889",
      category: "European Paintings",
      sourceUrl: record.objectURL,
    },
    source: "The Metropolitan Museum of Art",
  });
});

test("backend supplies defaults for missing optional metadata", async () => {
  const fakeFetch: typeof fetch = async () =>
    Response.json({ objectID: 1, title: "Untitled study" });

  const response = await getMuseumResponse(fakeFetch);
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.item).toMatchObject({
    artist: "Artist not recorded",
    date: "Date not recorded",
    category: "Uncategorised",
    sourceUrl: null,
  });
});

test("backend rejects malformed upstream records", async () => {
  const invalidRecords = [
    null,
    {},
    { objectID: "436535", title: "Wrong ID type" },
    { objectID: 1, title: " " },
    { objectID: 1, title: "Study", artistDisplayName: 42 },
  ];

  for (const invalid of invalidRecords) {
    const fakeFetch: typeof fetch = async () => Response.json(invalid);
    const response = await getMuseumResponse(fakeFetch);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "The museum returned an unexpected record format.",
    });
  }
});

test("backend rejects invalid upstream JSON", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response("not-json", { status: 200 });

  const response = await getMuseumResponse(fakeFetch);
  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({
    error: "The museum returned invalid JSON.",
  });
});

test("backend maps upstream HTTP failure to 502", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response("Unavailable", { status: 503 });

  const response = await getMuseumResponse(fakeFetch);
  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({
    error: "The museum service is unavailable. Please retry.",
  });
});

test("backend maps a timeout to 504", async () => {
  const fakeFetch: typeof fetch = async () => {
    throw new DOMException("Simulated timeout", "TimeoutError");
  };

  const response = await getMuseumResponse(fakeFetch);
  expect(response.status).toBe(504);
  expect(await response.json()).toEqual({
    error: "The museum service took too long to respond. Please retry.",
  });
});

test("backend handles connection failure without leaking details", async () => {
  const fakeFetch: typeof fetch = async () => {
    throw new TypeError("Internal connection details");
  };

  const response = await getMuseumResponse(fakeFetch);
  expect(response.status).toBe(502);
  const body = await response.json();
  expect(body).toEqual({
    error: "Could not connect to the museum service. Please retry.",
  });
  expect(JSON.stringify(body)).not.toContain("Internal connection details");
});
