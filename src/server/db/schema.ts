import { doublePrecision, pgTable, serial, text } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull(),
  store: text("store").notNull(),
  abv: doublePrecision("abv").notNull(),
  volume: doublePrecision("volume").notNull(),
  price: doublePrecision("price").notNull(),
  alcoholUnitPrice: doublePrecision("alcohol_unit_price").notNull(),
});
