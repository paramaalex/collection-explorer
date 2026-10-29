import { connection } from "next/server";
import { version } from "../../../../package.json";

export async function GET() {
  await connection();

  return Response.json(
    {
      status: "ok",
      service: "collection-explorer",
      version,
      checkedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
