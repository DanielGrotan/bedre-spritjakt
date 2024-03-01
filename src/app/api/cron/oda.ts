import { z } from "zod";

const SECTION_IDS = ["1237", "1243", "1244"];

const apiResponseSchema = z.object({
  title: z.union([
    z.literal("Øl"),
    z.literal("Cider"),
    z.literal("Ferdigdrinker og hard seltzer"),
  ]),
  items: z.array(z.unknown()),
});

const productSchema = z.object({
  type: z.literal("product"),
  attributes: z.object({
    id: z.number().transform((value) => value.toString()),
  }),
});

const detailedProductSchema = z.object({
  gross_price: z.string().transform((value) => parseFloat(value)),
  gross_unit_price: z.string().transform((value) => parseFloat(value)),
  unit_price_quantity_abbreviation: z.literal("l"),
  detailed_info: z.object({
    local: z.array(
      z.object({
        language: z.string(),
        contents_table: z.object({
          rows: z.array(
            z.object({
              key: z.string(),
              value: z.string(),
            })
          ),
        }),
      })
    ),
  }),
});

export async function fetchOda() {
  const results = [];

  for (const sectionId of SECTION_IDS) {
    console.log(`Fetching Oda section id ${sectionId}`);

    const data = await fetch(
      `https://oda.com/tienda-web-api/v1/section-listing/categories/${sectionId}/${sectionId}/`
    ).then((res) => res.json());

    const validationResult = apiResponseSchema.safeParse(data);

    if (validationResult.success === false) {
      console.log(
        `Failed to validate Oda response for section id ${sectionId}`,
        validationResult.error
      );
      continue;
    }

    for (const item of validationResult.data.items) {
      const productValidationResult = productSchema.safeParse(item);

      if (productValidationResult.success === false) {
        continue;
      }

      const product = await fetchProduct(
        productValidationResult.data.attributes.id
      );

      if (product) {
        results.push(product);
      }
    }
  }

  return results;
}

async function fetchProduct(productId: string) {
  const data = await fetch(
    `https://oda.com/tienda-web-api/v1/products/${productId}/`
  ).then((res) => res.json());

  const detailedProductValidationResult = detailedProductSchema.safeParse(data);

  if (detailedProductValidationResult.success === false) {
    return;
  }

  for (const { language, contents_table } of detailedProductValidationResult
    .data.detailed_info.local) {
    if (language !== "nb") {
      continue;
    }

    const product: {
      size: number | undefined;
      abv: number | undefined;
    } = {
      size: undefined,
      abv: undefined,
    };

    for (const { key, value } of contents_table.rows) {
      switch (key) {
        case "Størrelse":
          const sizeMatch = value.match(/(\d+),?(\d+)?\s?([cml]+)/);

          if (sizeMatch) {
            // FIXME: handle different units
            const [, whole, decimal, unit] = sizeMatch;
            product.size = parseFloat(`${whole}.${decimal}`);
          }
          break;
        case "Alkoholinnhold":
          const bvaMatch = value.match(/(\d+).?(\d+)?%/);

          if (bvaMatch) {
            const [, whole, decimal] = bvaMatch;
            product.abv = parseFloat(`${whole}.${decimal}`);
          }
          break;
      }
    }

    if (product.size && product.abv) {
      const productData = detailedProductValidationResult.data;

      const volume =
        Math.round(
          (productData.gross_price / productData.gross_unit_price) * 1000
        ) / 1000;

      const alcoholVolume = volume * (product.abv / 100);
      const alcoholUnitPrice = productData.gross_price / alcoholVolume;

      return {
        productId,
        source: "oda",
        abv: product.abv,
        volume,
        price: productData.gross_price,
        alcoholUnitPrice,
      };
    }
  }
}
