'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import {
  useFirestore,
  FirestorePermissionError,
  errorEmitter,
} from '@/firebase';
import { useToast } from '@/hooks/use-toast';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

export type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isFeatured: boolean;
};

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  features: z.string().min(1, 'Please add at least one feature.'),
  isFeatured: z.boolean().default(false),
});

type PlanFormValues = z.infer<typeof formSchema>;

interface PlanDialogProps {
  plan?: Plan;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function PlanDialog({
  plan,
  open,
  onOpenChange,
}: PlanDialogProps) {
  const isEditMode = !!plan;
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      features: '',
      isFeatured: false,
    },
  });
  
  useEffect(() => {
    if (open) {
      if (isEditMode && plan) {
        form.reset({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          features: plan.features.join('\n'),
          isFeatured: plan.isFeatured || false,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          price: 0,
          features: '',
          isFeatured: false,
        });
      }
    }
  }, [open, isEditMode, plan, form]);

  async function onSubmit(values: PlanFormValues) {
    if (!firestore) return;
    setIsSubmitting(true);

    const planData = {
      ...values,
      features: values.features.split('\n').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (isEditMode && plan) {
        const planRef = doc(firestore, 'subscriptionPlans', plan.id);
        await setDoc(planRef, planData, { merge: true });
        toast({ title: 'Plan Updated', description: `${values.name} has been updated.` });
      } else {
        const plansCollection = collection(firestore, 'subscriptionPlans');
        await addDoc(plansCollection, planData);
        toast({ title: 'Plan Added', description: `${values.name} has been added.` });
      }
      onOpenChange(false);
    } catch (error) {
      const path = isEditMode && plan
        ? `subscriptionPlans/${plan.id}`
        : 'subscriptionPlans';
      const permissionError = new FirestorePermissionError({
        path,
        operation: isEditMode ? 'update' : 'create',
        requestResourceData: planData,
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
          <DialogDescription>
            Fill out the details for the subscription plan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Basic Recovery" {...field} />
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
                    <Input placeholder="Ideal for getting started..." {...field} />
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
                  <FormLabel>Price (per month)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="29.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features (one per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Personalized exercise plan..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Feature this plan?</FormLabel>
                     <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Add Plan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
