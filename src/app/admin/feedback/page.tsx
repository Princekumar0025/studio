'use client';

import { useState } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Star } from 'lucide-react';
import {
  collection,
  doc,
  deleteDoc,
  Timestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  const { toast } = useToast();
  const feedbackCollection = useMemoFirebase(() => firestore ? query(collection(firestore, 'feedback'), orderBy('submittedAt', 'desc')) : null, [firestore]);
  const { data: feedbackItems, isLoading } = useCollection<Feedback>(feedbackCollection);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = (feedbackId: string) => {
      if (!firestore) return;
      const docRef = doc(firestore, 'feedback', feedbackId);
      
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Feedback Deleted",
                description: `The feedback has been deleted.`,
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
            setIsDeleting(null);
        });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (feedbackItems?.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-8">
            <p>No feedback has been submitted yet.</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {feedbackItems?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Feedback from {item.userDisplayName || 'Anonymous'}</CardTitle>
                    <StarRating rating={item.rating} />
                </div>
              <CardDescription className="text-xs">
                Received on: {item.submittedAt?.toDate().toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{item.experience}</p>
            </CardContent>
            <CardFooter className="flex justify-end">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleting(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </AlertDialogTrigger>
                {isDeleting === item.id && (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this feedback.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleting(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                )}
                </AlertDialog>
            </CardFooter>
          </Card>
      ))}
    </div>
  );
}

export default function FeedbackAdminPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Feedback</h1>
      </div>
      <FeedbackList />
    </div>
  );
}

    