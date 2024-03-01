import {
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").notNull().primaryKey(),
  abv: doublePrecision("abv").notNull(),
  volume: doublePrecision("volume").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const prices = pgTable(
  "prices",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    store: text("store").notNull(),
    price: doublePrecision("price").notNull(),
    alcoholUnitPrice: doublePrecision("alcohol_unit_price").notNull(),
    timestamp: timestamp("timestamp").defaultNow(),
  },
  (table) => ({
    productIdIdx: index("product_id_idx").on(table.productId),
    storeIdx: index("store_idx").on(table.store),
    priceIdx: index("price_idx").on(table.price),
    alcoholUnitPriceIdx: index("alcohol_unit_price_idx").on(
      table.alcoholUnitPrice
    ),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
  })
);
