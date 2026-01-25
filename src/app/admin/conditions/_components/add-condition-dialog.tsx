'use client';

import { useState, useEffect } from 'react';
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
  slug: z.string().min(2, 'Slug must be at least 2 characters.').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  treatmentOptions: z.string().min(10, 'Treatment options must be at least 10 characters.'),
  relatedGuideSlugs: z.string().optional(),
});

type ConditionFormValues = z.infer<typeof formSchema>;

type Condition = {
  id: string;
  name: string;
  slug: string;
  description: string;
  treatmentOptions: string;
  relatedGuideSlugs?: string[];
};

interface ConditionDialogProps {
  condition?: Condition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConditionDialog({ condition, open, onOpenChange }: ConditionDialogProps) {
  const isEditMode = !!condition;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<ConditionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      treatmentOptions: '',
      relatedGuideSlugs: '',
    },
  });

  useEffect(() => {
    if (open && condition) {
      form.reset({
        name: condition.name,
        slug: condition.slug,
        description: condition.description,
        treatmentOptions: condition.treatmentOptions,
        relatedGuideSlugs: condition.relatedGuideSlugs?.join(', ') || '',
      });
    } else if (open && !condition) {
        form.reset();
    }
  }, [open, condition, form]);

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  async function onSubmit(values: ConditionFormValues) {
    if (!firestore) return;
    setIsSubmitting(true);
    
    const conditionData = {
        ...values,
        relatedGuideSlugs: values.relatedGuideSlugs?.split(',').map(s => s.trim()).filter(Boolean) || [],
    };
    
    try {
        if (isEditMode && condition) {
            const docRef = doc(firestore, 'conditions', condition.id);
            await setDoc(docRef, conditionData);
            toast({ title: 'Condition Updated', description: `${values.name} has been updated.` });
        } else {
            const collectionRef = collection(firestore, 'conditions');
            await addDoc(collectionRef, conditionData);
            toast({ title: 'Condition Added', description: `${values.name} has been added.` });
        }
        onOpenChange(false);
    } catch (error) {
        const path = isEditMode && condition ? `conditions/${condition.id}` : 'conditions';
        const permissionError = new FirestorePermissionError({
            path,
            operation: isEditMode ? 'update' : 'create',
            requestResourceData: conditionData,
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
          <DialogTitle>{isEditMode ? 'Edit Condition' : 'Add New Condition'}</DialogTitle>
          <DialogDescription>
            Fill out the details for the medical condition.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Plantar Fasciitis" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!isEditMode) {
                            form.setValue('slug', slugify(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., plantar-fasciitis" {...field} disabled={isEditMode} />
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
                    <Textarea placeholder="Detailed description of the condition..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="treatmentOptions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment Options</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Summary of available physiotherapy treatment options." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="relatedGuideSlugs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Guide Slugs</FormLabel>
                  <FormControl>
                    <Textarea placeholder="gentle-neck-stretches, back-pain-exercises" {...field} />
                  </FormControl>
                   <FormDescription>
                    Comma-separated list of URL slugs for related treatment guides.
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
                    {isEditMode ? 'Save Changes' : 'Add Condition'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
