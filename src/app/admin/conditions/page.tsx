'use client';

import { useState } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AddConditionDialog } from './_components/add-condition-dialog';
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
import Link from 'next/link';

type Condition = {
  id: string;
  name: string;
  slug: string;
};

function ConditionsList() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const conditionsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'conditions') : null, [firestore]);
  const { data: conditions, isLoading } = useCollection<Condition>(conditionsCollection);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = (conditionId: string, conditionName: string) => {
      if (!firestore) return;
      const docRef = doc(firestore, 'conditions', conditionId);
      
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Condition Removed",
                description: `${conditionName} has been removed.`,
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
            <CardFooter>
                 <Skeleton className="h-10 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (conditions?.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-8">
            <p>No conditions have been added yet.</p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {conditions?.map((condition) => (
          <Card key={condition.id}>
            <CardHeader>
              <CardTitle>{condition.name}</CardTitle>
              <CardDescription>/conditions/{condition.slug}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/conditions/${condition.slug}`} target="_blank">View</Link>
                </Button>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleting(condition.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </AlertDialogTrigger>
                {isDeleting === condition.id && (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the condition "{condition.name}".
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleting(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(condition.id, condition.name)}>
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

export default function ConditionsAdminPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Conditions</h1>
        <AddConditionDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Condition
          </Button>
        </AddConditionDialog>
      </div>
      <ConditionsList />
    </div>
  );
}
