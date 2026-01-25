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
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { DoctorDialog } from './_components/add-doctor-dialog';
import {
  collection,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

type Therapist = {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  specializations: string[];
};

function DoctorList() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const therapistsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'therapists') : null, [firestore]);
  const { data: therapists, isLoading } = useCollection<Therapist>(therapistsCollection);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Therapist | undefined>(undefined);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Therapist | null>(null);

  const handleAddClick = () => {
    setSelectedDoctor(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (doctor: Therapist) => {
    setSelectedDoctor(doctor);
    setDialogOpen(true);
  };

  const handleDeleteClick = (doctor: Therapist) => {
    setDoctorToDelete(doctor);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
      if (!firestore || !doctorToDelete) return;
      const docRef = doc(firestore, 'therapists', doctorToDelete.id);
      
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Doctor Removed",
                description: `${doctorToDelete.name} has been removed from the team.`,
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
            setDoctorToDelete(null);
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
              </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {therapists?.map((therapist) => {
        return (
          <Card key={therapist.id} className="flex flex-col">
            <CardHeader className="flex-grow">
              <div className="flex gap-4 items-center">
                 <Avatar className="h-24 w-24">
                    <AvatarImage src={therapist.imageUrl} alt={therapist.name} />
                    <AvatarFallback>
                    {therapist.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{therapist.name}</CardTitle>
                    <CardDescription>{therapist.title}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditClick(therapist)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(therapist)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete {doctorToDelete?.name}'s profile.
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
        );
      })}
    </div>
    <DoctorDialog open={dialogOpen} onOpenChange={setDialogOpen} doctor={selectedDoctor} />
    </>
  );
}

export default function DoctorsAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Doctors</h1>
        <Button onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Doctor
        </Button>
      </div>
      <DoctorList />
       <DoctorDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
