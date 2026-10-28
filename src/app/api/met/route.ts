import { connection } from "next/server";
import { getMuseumResponse } from "@/lib/met";

export async function GET() {
  await connection();
  return getMuseumResponse();
}
