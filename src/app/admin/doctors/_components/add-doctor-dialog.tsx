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
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  bio: z.string().min(10, 'Bio must be at least 10 characters.'),
  specializations: z.string().min(1, 'Please add at least one specialization.'),
  imageUrl: z.string().min(1, 'Image URL is required.'),
});

type DoctorFormValues = z.infer<typeof formSchema>;

type Therapist = {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  specializations: string[];
};

interface DoctorDialogProps {
  doctor?: Therapist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DoctorDialog({ doctor, open, onOpenChange }: DoctorDialogProps) {
  const isEditMode = !!doctor;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      title: '',
      bio: '',
      specializations: '',
      imageUrl: '',
    },
  });
  
  useEffect(() => {
    if (open && doctor) {
        form.reset({
            name: doctor.name,
            title: doctor.title,
            bio: doctor.bio,
            specializations: doctor.specializations.join(', '),
            imageUrl: doctor.imageUrl
        });
    } else if (open && !doctor) {
        form.reset();
    }
  }, [open, doctor, form]);
  
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
        toast({ title: 'Image Ready', description: 'The image has been prepared and will be saved with the doctor profile.' });
    };
    reader.onerror = () => {
        toast({ variant: 'destructive', title: 'Error Reading File', description: 'Could not read the selected file.' });
    };
    reader.readAsDataURL(file);

    if (event.target) event.target.value = '';
  };


  async function onSubmit(values: DoctorFormValues) {
    if (!firestore) return;
    setIsSubmitting(true);

    const doctorData = {
      ...values,
      specializations: values.specializations.split(',').map((s) => s.trim()).filter(Boolean),
    };
    
    try {
        if (isEditMode && doctor) {
            const docRef = doc(firestore, 'therapists', doctor.id);
            await setDoc(docRef, doctorData);
            toast({ title: 'Doctor Updated', description: `${values.name} has been updated.`});
        } else {
            const collectionRef = collection(firestore, 'therapists');
            await addDoc(collectionRef, doctorData);
            toast({ title: 'Doctor Added', description: `${values.name} has been added.`});
        }
        onOpenChange(false);
    } catch (error) {
        const path = isEditMode && doctor ? `therapists/${doctor.id}` : 'therapists';
        const permissionError = new FirestorePermissionError({
            path,
            operation: isEditMode ? 'update' : 'create',
            requestResourceData: doctorData
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
          <DialogDescription>
            Fill out the details below to manage a doctor in the system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="DPT, OCS, CSCS" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about the doctor..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="specializations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specializations (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Orthopedics, Pain Science" {...field} />
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
                    {isEditMode ? 'Save Changes' : 'Add Doctor'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
