"use server";

import { db } from "@/server/db";
import { prices, products } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function fetchProductsPage(limit: number, cursor: number) {
  const sq = db
    .selectDistinctOn([prices.productId, prices.store])
    .from(prices)
    .orderBy(prices.productId, prices.store, desc(prices.timestamp))
    .as("sq");

  const x = db
    .select()
    .from(sq)
    .innerJoin(products, eq(sq.productId, products.id))
    .orderBy(sq.alcoholUnitPrice)
    .limit(limit)
    .offset(cursor * limit);

  const data = await x;

  return {
    products: data.map(({ products, sq }) => ({
      ...products,
      price: sq,
    })),
    nextCursor: cursor + 1,
  };
}
