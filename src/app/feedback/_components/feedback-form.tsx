"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  useFirestore,
  useUser,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  rating: z.string().min(1, { message: 'Please select a rating.' }),
  experience: z.string().min(10, { message: "Please tell us a bit more about your experience." }).max(1000, "Your feedback is too long."),
});

export function FeedbackForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: "0",
      experience: "",
    },
  });
  
  const currentRating = parseInt(form.watch('rating') || "0");

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.'});
      return;
    }

    const submissionData = {
      rating: parseInt(values.rating),
      experience: values.experience,
      submittedAt: serverTimestamp(),
      ...(user && { userId: user.uid, userDisplayName: user.displayName || user.email }),
    };

    const feedbackCollection = collection(firestore, 'feedback');

    addDoc(feedbackCollection, submissionData)
      .then(() => {
        toast({
          title: "Feedback Submitted!",
          description: "Thank you for sharing your experience with us.",
        });
        form.reset();
      })
      .catch((error) => {
         const permissionError = new FirestorePermissionError({
            path: feedbackCollection.path,
            operation: 'create',
            requestResourceData: submissionData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  return (
    <Card className="p-6 md:p-8 shadow-lg border-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-3 text-center">
                  <FormLabel className="text-lg font-semibold">How would you rate your experience?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex justify-center gap-2"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <FormItem key={value}>
                          <FormControl>
                            <RadioGroupItem value={String(value)} id={`rating-${value}`} className="sr-only" />
                          </FormControl>
                          <FormLabel
                             htmlFor={`rating-${value}`}
                             className="cursor-pointer"
                             onMouseEnter={() => setHoverRating(value)}
                          >
                            <Star
                              className={cn(
                                'h-10 w-10 transition-colors',
                                (hoverRating >= value || currentRating >= value)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                            <span className="sr-only">{value} star</span>
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Tell us more</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you like? What could we do better?"
                      className="min-h-[150px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Feedback
            </Button>
          </form>
        </Form>
    </Card>
  );
}

    