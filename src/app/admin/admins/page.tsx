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
import {
  collection,
  doc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Admin = {
  id: string; // This is the UID
  addedOn: Timestamp;
};

function AdminsList() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const adminsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'admins') : null, [firestore]);
  const { data: admins, isLoading } = useCollection<Admin>(adminsCollection);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = (adminId: string) => {
      if (!firestore) return;
      const docRef = doc(firestore, 'admins', adminId);
      
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Admin Removed",
                description: `User ${adminId} is no longer an admin.`,
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
        {[...Array(2)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardFooter>
                    <Skeleton className="h-9 w-20" />
                </CardFooter>
            </Card>
        ))}
      </div>
    );
  }
  
  if (admins?.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-8">
            <p>No admins have been configured yet.</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {admins?.map((admin) => (
          <Card key={admin.id}>
            <CardHeader>
              <CardTitle className="text-base font-mono break-all">{admin.id}</CardTitle>
              <CardDescription>
                Added on: {admin.addedOn?.toDate().toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleting(admin.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Admin
                    </Button>
                </AlertDialogTrigger>
                {isDeleting === admin.id && (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will revoke admin privileges for the user with UID: <span className="font-mono break-all">{admin.id}</span>.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleting(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(admin.id)}>
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

export default function AdminsAdminPage() {
  const [newAdminUid, setNewAdminUid] = useState('');
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddAdmin = () => {
    if (!firestore || !newAdminUid.trim()) return;
    
    setIsAdding(true);
    const docRef = doc(firestore, 'admins', newAdminUid.trim());

    setDoc(docRef, { addedOn: serverTimestamp() })
      .then(() => {
        toast({
            title: "Admin Added",
            description: `User ${newAdminUid.trim()} has been granted admin privileges.`,
        });
        setNewAdminUid('');
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'create',
            requestResourceData: { addedOn: 'SERVER_TIMESTAMP' }
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsAdding(false);
      });
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6 gap-4 flex-col sm:flex-row">
        <div>
            <h1 className="text-2xl font-bold">Manage Admins</h1>
            <p className="text-muted-foreground">Add or remove users with administrative privileges.</p>
        </div>
        
      </div>
      <Card className="mb-6">
        <CardHeader>
            <CardTitle>Add New Admin</CardTitle>
            <CardDescription>Enter the Firebase UID of the user you want to make an admin.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex gap-2">
                <Input 
                    id="new-admin-uid"
                    placeholder="User ID (UID)"
                    value={newAdminUid}
                    onChange={(e) => setNewAdminUid(e.target.value)}
                    disabled={isAdding}
                />
                <Button onClick={handleAddAdmin} disabled={isAdding || !newAdminUid.trim()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isAdding ? 'Adding...' : 'Add Admin'}
                </Button>
            </div>
        </CardContent>
      </Card>
      <AdminsList />
    </div>
  );
}
