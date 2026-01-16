'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AddDoctorDialog } from './_components/add-doctor-dialog';
import {
  collection,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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

type Therapist = {
  id: string;
  name: string;
  title: string;
  imageId: string;
};

function DoctorList() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const therapistsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'therapists') : null, [firestore]);
  const { data: therapists, isLoading } = useCollection<Therapist>(therapistsCollection);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = (therapistId: string, therapistName: string) => {
      if (!firestore) return;
      const docRef = doc(firestore, 'therapists', therapistId);
      
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Doctor Removed",
                description: `${therapistName} has been removed from the team.`,
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
              <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {therapists?.map((therapist) => {
        const image = PlaceHolderImages.find((p) => p.id === therapist.imageId);
        return (
          <Card key={therapist.id}>
            <CardHeader>
              <CardTitle>{therapist.name}</CardTitle>
              <CardDescription>{therapist.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <Avatar className="h-24 w-24">
                <AvatarImage src={image?.imageUrl} alt={therapist.name} />
                <AvatarFallback>
                  {therapist.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </CardContent>
            <CardFooter>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleting(therapist.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </AlertDialogTrigger>
                {isDeleting === therapist.id && (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {therapist.name}'s profile.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleting(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(therapist.id, therapist.name)}>
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

export default function DoctorsAdminPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Doctors</h1>
        <AddDoctorDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </AddDoctorDialog>
      </div>
      <DoctorList />
    </div>
  );
}
