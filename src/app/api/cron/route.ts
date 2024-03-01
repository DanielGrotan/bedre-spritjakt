import { db } from "@/server/db";
import { prices, products } from "@/server/db/schema";
import { sql } from "drizzle-orm";
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

  const allProducts = [...menyProducts, ...odaProducts];

  const pricesData = allProducts.map((product) => ({
    productId: product.externalId,
    store: product.store,
    price: product.price,
    alcoholUnitPrice: product.alcoholUnitPrice,
  }));

  const productsData = allProducts.map((product) => ({
    id: product.externalId,
    abv: product.abv,
    volume: product.volume,
  }));

  await db.transaction(async (trx) => {
    await trx.insert(prices).values(pricesData);
    await trx
      .insert(products)
      .values(productsData)
      .onConflictDoUpdate({
        target: products.id,
        set: {
          abv: sql`EXCLUDED.abv`,
          volume: sql`EXCLUDED.volume`,
        },
      });
  });

  return Response.json({ success: true });
}
