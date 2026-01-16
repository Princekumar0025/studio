import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddProductDialog } from './_components/add-product-dialog';

export default function StoreAdminPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Store</h1>
        <AddProductDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </AddProductDialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
          <CardDescription>
            A list of all products in the store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Product management interface will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

    