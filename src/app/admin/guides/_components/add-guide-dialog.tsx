'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const stepSchema = z.object({
  title: z.string().min(2, 'Step title must be at least 2 characters.'),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters.'),
});

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters.').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  imageId: z.string().min(1, 'Image ID is required.'),
  steps: z.array(stepSchema).min(1, 'At least one step is required.'),
});

export function AddGuideDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      imageId: '',
      steps: [{ title: '', instructions: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps"
  });
  
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    const guidesCollection = collection(firestore, 'treatmentGuides');
    
    addDoc(guidesCollection, values)
      .then(() => {
        toast({
          title: 'Guide Added',
          description: `${values.title} has been added.`,
        });
        form.reset();
        setOpen(false);
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: guidesCollection.path,
            operation: 'create',
            requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error('Error adding document: ', error);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Treatment Guide</DialogTitle>
          <DialogDescription>
            Fill out the details for the new treatment guide.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guide Title</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="e.g., Gentle Neck Stretches" 
                        {...field}
                        onChange={(e) => {
                            field.onChange(e);
                            form.setValue('slug', slugify(e.target.value));
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
                    <Input placeholder="e.g., gentle-neck-stretches" {...field} />
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
                    <Textarea placeholder="A series of simple stretches..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., neck-stretches-guide" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />

            <div>
              <h3 className="text-lg font-medium">Steps</h3>
            </div>

            {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-md border p-4 relative">
                     <FormField
                        control={form.control}
                        name={`steps.${index}.title`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Step {index + 1} Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Neck Tilt" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`steps.${index}.instructions`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Instructions</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Gently tilt your head..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 h-6 w-6"
                    >
                       <Trash2 className="h-4 w-4" />
                       <span className="sr-only">Remove Step</span>
                    </Button>
                </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ title: "", instructions: "" })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Step
            </Button>
            
            <DialogFooter>
              <Button type="submit">Add Guide</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
