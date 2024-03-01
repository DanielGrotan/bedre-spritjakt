import {
  doublePrecision,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").notNull().primaryKey(),
  abv: doublePrecision("abv").notNull(),
  volume: doublePrecision("volume").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const prices = pgTable("prices", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull(),
  store: text("store").notNull(),
  price: doublePrecision("price").notNull(),
  alcoholUnitPrice: doublePrecision("alcohol_unit_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
