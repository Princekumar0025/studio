'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { ProductDialog, type Product } from './_components/add-product-dialog';
import {
  collection,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function StoreAdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, isLoading } = useCollection<Product>(productsCollection);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleAddClick = () => {
    setSelectedProduct(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const handleDeleteConfirm = () => {
      if (!firestore || !productToDelete) return;
      const docRef = doc(firestore, 'products', productToDelete.id);
      
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Product Removed",
                description: `${productToDelete.name} has been removed from the store.`,
            });
        })
        .catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
            setProductToDelete(null);
        });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Store</h1>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                  <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter>
                  <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.map((product) => {
            return (
              <Card key={product.id} className="flex flex-col">
                {product.imageUrl && (
                    <div className="relative h-48 w-full">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover rounded-t-lg" />
                    </div>
                )}
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>${product.price.toFixed(2)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(product)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(product)}>
                      <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} product={selectedProduct} />
      
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product "{productToDelete?.name}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
                Continue
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
