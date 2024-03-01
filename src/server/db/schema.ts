import { decimal, pgTable, serial, text } from "drizzle-orm/pg-core";

export const ProductsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull(),
  store: text("store").notNull(),
  abv: decimal("abv").notNull(),
  volume: decimal("volume").notNull(),
  price: decimal("price").notNull(),
  alocoholUnitPrice: decimal("alcohol_unit_price").notNull(),
});
