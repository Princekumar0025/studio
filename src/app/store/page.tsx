'use client';
import { ProductCard } from "./_components/product-card";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/lib/data'; // keep this type for ProductCard

function StoreLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col overflow-hidden shadow-lg border-2 h-full rounded-lg">
                    <Skeleton className="h-60 w-full" />
                    <div className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-5/6 mt-2" />
                    </div>
                    <div className="p-6 pt-0 flex justify-between items-center">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function StorePage() {
  const firestore = useFirestore();
  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, isLoading } = useCollection<Product>(productsCollection);

  return (
    <div className="container py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Equipment Store</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Enhance your recovery with our curated selection of high-quality physiotherapy equipment.
        </p>
      </div>
      
      {isLoading && <StoreLoadingSkeleton />}

      {!isLoading && products && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
      )}

      {!isLoading && !products?.length && (
         <div className="text-center text-muted-foreground py-8">
            <p>No products available in the store at this time. Please check back later.</p>
        </div>
      )}
    </div>
  );
}
