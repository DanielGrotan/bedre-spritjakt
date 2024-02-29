import { z } from "zod";

const apiResponseSchema = z.object({
  hits: z.object({
    hits: z.array(z.unknown()),
  }),
});

const productSchema = z.object({
  _source: z.object({
    alcoholPercentage: z.number(),
    pricePerUnit: z.number(),
    comparePricePerUnit: z.number(),
    compareUnit: z.literal("l"),
    ean: z.string(),
  }),
});

export async function fetchMeny() {
  const products = [];

  const data = await fetch(
    "https://platform-rest-prod.ngdata.no/api/products/1300/7080001150488?page=1&page_size=2000&full_response=true&fieldset=maximal&facets=Category%2CAllergen&facet=Categories%3ADrikke&showNotForSale=true"
  ).then((res) => res.json());

  const validationResult = apiResponseSchema.safeParse(data);

  if (validationResult.success === false) {
    console.log("Failed to validate Meny response", validationResult.error);
    return [];
  }

  for (const hit of validationResult.data.hits.hits) {
    const productValidationResult = productSchema.safeParse(hit);

    if (productValidationResult.success === false) {
      continue;
    }

    const source = productValidationResult.data._source;
    const abv = source.alcoholPercentage;
    const price = source.pricePerUnit;

    if (abv <= 0) {
      continue;
    }

    const pricePerUnit = source.comparePricePerUnit;

    // FIXME: extend to work with other units than "l"
    const compareUnit = source.compareUnit;
    const volume = Math.round((price / pricePerUnit) * 1000) / 1000;
    const alcoholVolume = volume * (abv / 100);
    const alcoholUnitPrice = price / alcoholVolume;

    products.push({
      ean: source.ean,
      source: "meny",
      abv,
      volume,
      price,
      alcoholUnitPrice,
    });
  }

  return products;
}
