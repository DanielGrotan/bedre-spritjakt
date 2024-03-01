import { ProductList } from "@/components/product-list";

export default async function HomePage() {
  return (
    <div className="container mt-4">
      <ProductList pageSize={20} />
    </div>
  );
}
