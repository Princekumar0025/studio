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
import { Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Timestamp;
};

export default function ContactAdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const submissionsCollection = useMemoFirebase(() => firestore ? query(collection(firestore, 'contactFormSubmissions'), orderBy('submittedAt', 'desc')) : null, [firestore]);
  const { data: submissions, isLoading } = useCollection<ContactSubmission>(submissionsCollection);
  const [submissionToDelete, setSubmissionToDelete] = useState<ContactSubmission | null>(null);

  const handleDeleteConfirm = () => {
      if (!firestore || !submissionToDelete) return;
      const docRef = doc(firestore, 'contactFormSubmissions', submissionToDelete.id);
      
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Message Deleted",
                description: `The message has been deleted.`,
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
            setSubmissionToDelete(null);
        });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contact Form Messages</h1>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter>
                   <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : submissions?.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
              <p>No messages have been received yet.</p>
          </div>
      ) : (
        <div className="space-y-4">
          {submissions?.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <CardTitle>{submission.subject}</CardTitle>
                  <CardDescription>From: {submission.name} ({submission.email})</CardDescription>
                  <CardDescription className="text-xs">
                    Received on: {submission.submittedAt?.toDate().toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{submission.message}</p>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => setSubmissionToDelete(submission)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                  </Button>
                </CardFooter>
              </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!submissionToDelete} onOpenChange={(open) => !open && setSubmissionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this message.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSubmissionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
                Continue
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
