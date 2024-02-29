import { NextRequest } from "next/server";
import { fetchMeny } from "./meny";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const menyProducts = await fetchMeny();

  return Response.json({ products: menyProducts });
}
