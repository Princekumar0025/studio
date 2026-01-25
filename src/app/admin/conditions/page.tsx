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
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { ConditionDialog } from './_components/add-condition-dialog';
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
import Link from 'next/link';

type Condition = {
  id: string;
  name: string;
  slug: string;
  description: string;
  treatmentOptions: string;
  relatedGuideSlugs?: string[];
};

function ConditionsList() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const conditionsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'conditions') : null, [firestore]);
  const { data: conditions, isLoading } = useCollection<Condition>(conditionsCollection);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<Condition | undefined>(undefined);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [conditionToDelete, setConditionToDelete] = useState<Condition | null>(null);

  const handleAddClick = () => {
    setSelectedCondition(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (condition: Condition) => {
    setSelectedCondition(condition);
    setDialogOpen(true);
  };

  const handleDeleteClick = (condition: Condition) => {
    setConditionToDelete(condition);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
      if (!firestore || !conditionToDelete) return;
      const docRef = doc(firestore, 'conditions', conditionToDelete.id);
      
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Condition Removed",
                description: `${conditionToDelete.name} has been removed.`,
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
            setConditionToDelete(null);
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
                 <Skeleton className="h-10 w-full" />
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
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {conditions?.map((condition) => (
          <Card key={condition.id} className="flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle>{condition.name}</CardTitle>
              <CardDescription>/conditions/{condition.slug}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/conditions/${condition.slug}`} target="_blank">View</Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(condition)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(condition)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the condition "{conditionToDelete?.name}".
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
                </div>
            </CardFooter>
          </Card>
      ))}
    </div>
    <ConditionDialog open={dialogOpen} onOpenChange={setDialogOpen} condition={selectedCondition} />
    </>
  );
}

export default function ConditionsAdminPage() {
    const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Conditions</h1>
         <Button onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Condition
          </Button>
      </div>
      <ConditionsList />
      <ConditionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
