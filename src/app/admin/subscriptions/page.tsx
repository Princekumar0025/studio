'use client';

import { useState } from 'react';
import { collectionGroup, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, FirestorePermissionError, errorEmitter, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';


type UserSubscription = {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelled';
  startDate: Timestamp;
  endDate: Timestamp;
  price: number;
};

export default function SubscriptionsAdminPage() {
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const subscriptionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collectionGroup(firestore, 'subscriptions');
  }, [firestore]);
  
  const { data: subscriptions, isLoading } = useCollection<UserSubscription>(subscriptionsQuery);

  const handleStatusChange = (subscription: UserSubscription, newStatus: 'active' | 'cancelled') => {
    if (!firestore || subscription.status === newStatus) return;

    setUpdatingStatus(subscription.id);
    const docRef = doc(firestore, 'users', subscription.userId, 'subscriptions', subscription.id);

    updateDoc(docRef, { status: newStatus })
      .then(() => {
        toast({ 
          title: 'Status Updated & Notification Sent', 
          description: `Subscription for ${subscription.userEmail} is now ${newStatus}. A confirmation email and WhatsApp message have been sent.`
        });
      })
      .catch(error => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { status: newStatus }
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setUpdatingStatus(null);
      });
  };

  const getSubscriptionStatus = (sub: UserSubscription): 'active' | 'cancelled' | 'expired' => {
    if (sub.status === 'cancelled') {
      return 'cancelled';
    }
    if (sub.endDate && sub.endDate.toDate() < new Date()) {
      return 'expired';
    }
    return 'active';
  };
  
  const sortedSubscriptions = subscriptions?.sort((a,b) => b.startDate.toMillis() - a.startDate.toMillis());

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Patient Subscriptions</h1>
          <p className="text-muted-foreground">View and manage all active and past patient subscriptions.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && sortedSubscriptions && sortedSubscriptions.length > 0 ? (
                sortedSubscriptions.map((sub) => {
                  const status = getSubscriptionStatus(sub);
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.userEmail}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.planName}</TableCell>
                      <TableCell className="text-center">
                          <Badge 
                            variant={status === 'active' ? 'success' : (status === 'expired' ? 'secondary' : 'destructive')}
                            className="capitalize"
                          >
                              {status}
                          </Badge>
                      </TableCell>
                      <TableCell>{format(sub.startDate.toDate(), 'PPP')}</TableCell>
                      <TableCell>{sub.endDate ? format(sub.endDate.toDate(), 'PPP') : 'Never'}</TableCell>
                      <TableCell className="text-right">${sub.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          {updatingStatus === sub.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                  <Button aria-haspopup="true" size="icon" variant="ghost" disabled={status === 'expired'}>
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Toggle menu</span>
                                  </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleStatusChange(sub, 'active')} disabled={sub.status === 'active'}>Set to Active</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(sub, 'cancelled')} disabled={sub.status === 'cancelled'} className="text-destructive">Set to Cancelled</DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No patient subscriptions found.
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
    
