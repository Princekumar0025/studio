'use client';

import { useState } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AddGuideDialog } from './_components/add-guide-dialog';
import {
  collectionGroup,
  doc,
  deleteDoc,
  query
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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Guide = {
  id: string;
  title: string;
  description: string;
  imageId: string;
  conditionId: string;
  // This is the full path to the document, provided by collectionGroup queries
  docPath: string; 
};

function GuidesList() {
  const firestore = useFirestore();
  const { toast } = useToast();
  // Use a collectionGroup query to get all 'treatmentGuides' from all 'conditions'.
  const guidesQuery = useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'treatmentGuides')) : null, [firestore]);
  const { data: guides, isLoading, error } = useCollection<Omit<Guide, 'docPath'>>(guidesQuery);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = (guide: Guide) => {
      if (!firestore) return;
      
      // We need to construct the full path to the document to delete it.
      // Firestore path for a subcollection document: /collection/{docId}/subcollection/{subDocId}
      const docRef = doc(firestore, `conditions/${guide.conditionId}/treatmentGuides`, guide.id);
      
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Guide Removed",
                description: `${guide.title} has been removed.`,
            });
        })
        .catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            console.error("Error removing document: ", error);
        })
        .finally(() => {
            setIsDeleting(null);
        });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-32 w-full" />
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (guides?.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-8">
            <p>No treatment guides have been added yet.</p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {guides?.map((guide) => {
        const image = PlaceHolderImages.find((p) => p.id === guide.imageId);
        return (
          <Card key={guide.id} className="flex flex-col">
            {image && (
                <div className="relative h-48 w-full">
                    <Image src={image.imageUrl} alt={guide.title} fill className="object-cover rounded-t-lg" />
                </div>
            )}
            <CardHeader>
              <CardTitle>{guide.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{guide.description}</p>
            </CardContent>
            <CardFooter>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleting(guide.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </AlertDialogTrigger>
                {isDeleting === guide.id && (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the guide "{guide.title}".
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleting(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(guide as Guide)}>
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                )}
                </AlertDialog>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}


export default function GuidesAdminPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Treatment Guides</h1>
        <AddGuideDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Guide
          </Button>
        </AddGuideDialog>
      </div>
      <GuidesList />
    </div>
  );
}
