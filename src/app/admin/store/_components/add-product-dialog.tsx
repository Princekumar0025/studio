'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  imageUrl: z.string().min(1, 'Image URL is required.'),
});

type ProductFormValues = z.infer<typeof formSchema>;

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

interface ProductDialogProps {
  product?: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDialog({ product, open, onOpenChange }: ProductDialogProps) {
  const isEditMode = !!product;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (open) {
        if (product) {
            form.reset(product);
        } else {
            form.reset({
                name: '',
                description: '',
                price: 0,
                imageUrl: '',
            });
        }
    }
  }, [open, product, form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select an image file.' });
        return;
    }

    if (file.size > 500 * 1024) { // 500KB limit
        toast({ variant: 'destructive', title: 'Image Too Large', description: 'Please select an image smaller than 500KB.' });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        form.setValue('imageUrl', dataUri);
        toast({ title: 'Image Ready', description: 'The image has been prepared and will be saved with the product.' });
    };
    reader.onerror = () => {
        toast({ variant: 'destructive', title: 'Error Reading File', description: 'Could not read the selected file.' });
    };
    reader.readAsDataURL(file);

    if (event.target) event.target.value = '';
  };

  function onSubmit(values: ProductFormValues) {
    if (!firestore) return;
    setIsSubmitting(true);
    
    const operation = isEditMode ? 'update' : 'create';
    const promise = isEditMode && product
        ? setDoc(doc(firestore, 'products', product.id), values)
        : addDoc(collection(firestore, 'products'), values);
    
    promise.then(() => {
        toast({ 
            title: `Product ${isEditMode ? 'Updated' : 'Added'}`,
            description: `${values.name} has been successfully ${isEditMode ? 'updated' : 'added'}.`
        });
        onOpenChange(false);
    }).catch((error) => {
        console.error(`Failed to ${operation} product:`, error);
        const path = isEditMode && product ? `products/${product.id}` : 'products';
        const permissionError = new FirestorePermissionError({
            path: path,
            operation,
            requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: `Failed to ${operation} product`,
            description: "An error occurred. Please check your permissions and try again.",
        });
    }).finally(() => {
        setIsSubmitting(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            Fill out the details below to add a new product to the store.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="High-Density Foam Roller" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the product..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="24.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                        <Input placeholder="Enter URL or upload an image" {...field} />
                        <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()}>Upload</Button>
                        <input 
                            type="file" 
                            ref={imageInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Provide a URL or upload a small image (under 500KB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
