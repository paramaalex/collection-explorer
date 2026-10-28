type CollectionItem = {
  id: string;
  title: string;
  category: string;
  year: number;
};

const items: CollectionItem[] = [
  { id: "demo-001", title: "Coastal landscape", category: "Art", year: 1920 },
  { id: "demo-002", title: "Forest bird study", category: "Natural history", year: 1965 },
  { id: "demo-003", title: "Harbour photograph", category: "Photography", year: 1948 },
  { id: "demo-004", title: "Mountain landscape", category: "Art", year: 1982 },
  { id: "demo-005", title: "Fern specimen", category: "Natural history", year: 1974 },
  { id: "demo-006", title: "City street photograph", category: "Photography", year: 1956 },
];

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim().toLowerCase();
  const category = params.get("category") ?? "All";

  if (query.length > 100) {
    return Response.json(
      { error: "Search must be 100 characters or fewer." },
      { status: 400 },
    );
  }

  if (!["All", "Art", "Natural history", "Photography"].includes(category)) {
    return Response.json(
      { error: "Unsupported category." },
      { status: 400 },
    );
  }

  const results = items.filter((item) =>
    `${item.title} ${item.category}`.toLowerCase().includes(query) &&
    (category === "All" || item.category === category)
  );

  return Response.json({
    items: results,
    total: results.length,
    source: "Fictional demonstration records",
  });
}
