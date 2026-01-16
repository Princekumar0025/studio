'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, doc } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const stepSchema = z.object({
  title: z.string().min(1, 'Step title is required.'),
  instructions: z.string().min(1, 'Step instructions are required.'),
});

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  imageId: z.string().min(1, 'Image ID is required.'),
  conditionId: z.string().min(1, 'Please select a condition.'),
  steps: z.array(stepSchema).min(1, 'At least one step is required.'),
});

type Condition = {
  id: string;
  name: string;
}

export function AddGuideDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const conditionsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'conditions') : null, [firestore]);
  const { data: conditions } = useCollection<Condition>(conditionsCollection);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      imageId: '',
      conditionId: '',
      steps: [{ title: '', instructions: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps"
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    // A guide is stored in a subcollection under a specific condition
    const guidesCollection = collection(firestore, 'conditions', values.conditionId, 'treatmentGuides');
    
    // We don't want to store the conditionId inside the guide document itself,
    // as it's already part of the document's path.
    const { conditionId, ...guideData } = values;

    addDoc(guidesCollection, guideData)
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
            requestResourceData: guideData,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error('Error adding document: ', error);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Treatment Guide</DialogTitle>
          <DialogDescription>
            Fill out the details for the new guide.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-96 pr-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="conditionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a condition for this guide" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conditions?.map(condition => (
                            <SelectItem key={condition.id} value={condition.id}>{condition.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guide Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Gentle Neck Stretches" {...field} />
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
                        <Textarea placeholder="A short description of the guide..." {...field} />
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
                <div>
                  <FormLabel>Steps</FormLabel>
                  <div className="space-y-4 mt-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start p-3 border rounded-md">
                        <span className="text-sm font-semibold mt-2">{index + 1}.</span>
                        <div className="flex-grow space-y-2">
                           <FormField
                              control={form.control}
                              name={`steps.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Step Title" {...field} />
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
                                  <FormControl>
                                    <Textarea placeholder="Step Instructions..." {...field} rows={2} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => remove(index)}
                          className="mt-1"
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ title: "", instructions: "" })}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Step
                    </Button>
                  </div>
                  <FormMessage>{form.formState.errors.steps?.message}</FormMessage>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="submit">Add Guide</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
