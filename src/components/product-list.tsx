"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { fetchProductsPage } from "@/data/products";
import { changeDecimalSymbol } from "@/lib/utils";
import { prices, products } from "@/server/db/schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { InferSelectModel } from "drizzle-orm";
import Image from "next/image";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

type ProductWithPrice = InferSelectModel<typeof products> & {
  price: InferSelectModel<typeof prices>;
};

type ProductListProps = {
  pageSize: number;
};

export function ProductList({ pageSize }: ProductListProps) {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["products"],
      queryFn: ({ pageParam }) => fetchProductsPage(pageSize, pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const { ref, inView } = useInView();

  useEffect(() => {
    console.log(inView, hasNextPage);

    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(240px,_1fr))] gap-4">
        {data.pages.map((page) =>
          page.products.map((product) => (
            <Product key={product.id} {...product} />
          ))
        )}
      </div>

      <div ref={ref} className="mb-6">
        {isFetchingNextPage && "Loading..."}
      </div>
    </div>
  );
}

type ProductProps = ProductWithPrice;

function Product({ name, abv, volume, price, imageUrl }: ProductProps) {
  return (
    <Card>
      <div className="aspect-square relative">
        {imageUrl && (
          <Image
            unoptimized
            src={imageUrl}
            alt={name}
            fill
            className="object-contain"
          />
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="capitalize text-xs font-semibold">{price.store}</p>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-semibold">
            {changeDecimalSymbol(price.price)} kr
          </p>
          <p>
            {abv}%, {volume} L
          </p>
        </div>
        <div className="text-right">
          {new Intl.NumberFormat("no", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(price.alcoholUnitPrice)}{" "}
          kr / L
        </div>
      </CardHeader>
    </Card>
  );
}
