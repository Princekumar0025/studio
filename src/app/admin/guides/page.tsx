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
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { GuideDialog } from './_components/add-guide-dialog';
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
  videoUrl?: string;
};

function GuidesList() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const guidesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'treatmentGuides') : null, [firestore]);
  const { data: guides, isLoading } = useCollection<TreatmentGuide>(guidesCollection);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<TreatmentGuide | undefined>(undefined);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [guideToDelete, setGuideToDelete] = useState<TreatmentGuide | null>(null);

  const handleAddClick = () => {
    setSelectedGuide(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (guide: TreatmentGuide) => {
    setSelectedGuide(guide);
    setDialogOpen(true);
  };

  const handleDeleteClick = (guide: TreatmentGuide) => {
    setGuideToDelete(guide);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
      if (!firestore || !guideToDelete) return;
      const docRef = doc(firestore, 'treatmentGuides', guideToDelete.id);
      
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Guide Removed",
                description: `${guideToDelete.title} has been removed.`,
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
            setDeleteAlertOpen(false);
            setGuideToDelete(null);
        });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
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
    <>
    <div className="space-y-6">
      {guides?.map((guide) => {
        return (
          <Card key={guide.id} className="overflow-hidden">
             {guide.imageUrl && (
                <div className="relative h-48 w-full">
                    <Image src={guide.imageUrl} alt={guide.title} fill className="object-cover" />
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
                <Button variant="outline" size="sm" onClick={() => handleEditClick(guide)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(guide)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the guide "{guideToDelete?.title}".
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteAlertOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
          </Card>
        )
      })}
    </div>
    <GuideDialog open={dialogOpen} onOpenChange={setDialogOpen} guide={selectedGuide} />
    </>
  );
}

export default function GuidesAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Treatment Guides</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Guide
        </Button>
      </div>
      <GuidesList />
      <GuideDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
