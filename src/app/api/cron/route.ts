import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { NextRequest } from "next/server";
import { fetchMeny } from "./meny";
import { fetchOda } from "./oda";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const menyProducts = await fetchMeny();
  const odaProducts = await fetchOda();

  await db.insert(products).values(menyProducts.concat(odaProducts));

  return Response.json({ success: true });
}
