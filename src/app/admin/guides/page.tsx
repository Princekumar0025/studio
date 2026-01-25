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
  collection,
  doc,
  deleteDoc,
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
import Link from 'next/link';

type GuideStep = {
  title: string;
  instructions: string;
};

type TreatmentGuide = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  steps: GuideStep[];
};

function GuidesList() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const guidesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'treatmentGuides') : null, [firestore]);
  const { data: guides, isLoading } = useCollection<TreatmentGuide>(guidesCollection);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = (guideId: string, guideTitle: string) => {
      if (!firestore) return;
      const docRef = doc(firestore, 'treatmentGuides', guideId);
      
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Guide Removed",
                description: `${guideTitle} has been removed.`,
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
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
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
    <div className="space-y-6">
      {guides?.map((guide) => {
        return (
          <Card key={guide.id}>
             {guide.imageUrl && (
                <div className="relative h-48 w-full">
                    <Image src={guide.imageUrl} alt={guide.title} fill className="object-cover rounded-t-lg" />
                </div>
            )}
            <CardHeader>
              <CardTitle>{guide.title}</CardTitle>
              <CardDescription>{guide.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <h4 className="font-semibold mb-2">Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    {guide.steps.map((step, index) => (
                        <li key={index}>
                            <span className="font-semibold text-foreground">{step.title}:</span> {step.instructions}
                        </li>
                    ))}
                </ol>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/guides/${guide.slug}`} target="_blank">View</Link>
                </Button>
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
                        <AlertDialogAction onClick={() => handleDelete(guide.id, guide.title)}>
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                )}
                </AlertDialog>
            </CardFooter>
          </Card>
        )
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
