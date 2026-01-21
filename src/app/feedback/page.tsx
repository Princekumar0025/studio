'use client';

import { FeedbackForm } from './_components/feedback-form';
import { GoogleReviews } from './_components/google-reviews';
import {
  collection,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Feedback = {
  id: string;
  rating: number;
  experience: string;
  submittedAt: Timestamp;
  userDisplayName?: string;
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 ${
                        i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    );
}

function FeedbackList() {
  const firestore = useFirestore();
  const feedbackCollection = useMemoFirebase(() => firestore ? query(collection(firestore, 'feedback'), orderBy('submittedAt', 'desc')) : null, [firestore]);
  const { data: feedbackItems, isLoading } = useCollection<Feedback>(feedbackCollection);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-1/4 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (feedbackItems?.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-12">
            <p>Be the first to leave feedback!</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      {feedbackItems?.map((item) => (
          <Card key={item.id} className="border-2 shadow-sm">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <CardTitle className="text-lg font-semibold">From {item.userDisplayName || 'Anonymous'}</CardTitle>
                    <StarRating rating={item.rating} />
                </div>
              <CardDescription className="text-xs pt-1">
                {item.submittedAt?.toDate().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground italic">"{item.experience}"</p>
            </CardContent>
          </Card>
      ))}
    </div>
  );
}


export default function FeedbackPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="max-w-xl">
                <div className="text-left mb-10">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Share Your Experience</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Your feedback helps us improve our services. Please let us know how we did.
                    </p>
                </div>
                <FeedbackForm />
            </div>
             <div className="max-w-xl">
                 <h2 className="font-headline text-3xl font-bold mb-8">What Our Patients Say</h2>
                 <Tabs defaultValue="patient-feedback" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="patient-feedback">From Our Patients</TabsTrigger>
                        <TabsTrigger value="google-reviews">From Google</TabsTrigger>
                    </TabsList>
                    <TabsContent value="patient-feedback" className="pt-6">
                        <FeedbackList />
                    </TabsContent>
                    <TabsContent value="google-reviews" className="pt-6">
                        <GoogleReviews />
                    </TabsContent>
                 </Tabs>
            </div>
        </div>
      </div>
    </div>
  );
}
