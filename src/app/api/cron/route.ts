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
    name: product.name,
    description: product.description,
    abv: product.abv,
    volume: product.volume,
    imageUrl: product.imageUrl,
  }));

  await db.transaction(async (trx) => {
    await trx
      .insert(products)
      .values(productsData)
      .onConflictDoUpdate({
        target: products.id,
        set: {
          name: sql`EXCLUDED.name`,
          description: sql`EXCLUDED.description`,
          abv: sql`EXCLUDED.abv`,
          volume: sql`EXCLUDED.volume`,
          imageUrl: sql`EXCLUDED.image_url`,
          updatedAt: sql`NOW()`,
        },
      });
    await trx.insert(prices).values(pricesData);
  });

  return Response.json({ success: true });
}
