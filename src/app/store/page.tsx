import { ProductCard } from "./_components/product-card";
import { products } from "@/lib/data";

export default function StorePage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Equipment Store</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Enhance your recovery with our curated selection of high-quality physiotherapy equipment.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
