'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type UserSubscription = {
    id: string;
    planName: string;
    status: 'active' | 'cancelled';
    startDate: Timestamp;
    endDate: Timestamp;
    price: number;
};

function AccountLoadingSkeleton() {
    return (
        <div className="container py-12 md:py-20">
            <div className="flex items-center gap-6 mb-12">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
            </div>
            <div className='space-y-8'>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-1/3" />
                    </CardHeader>
                    <CardContent>
                         <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-1/3" />
                    </CardHeader>
                    <CardContent>
                         <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function getSubscriptionStatus(sub: UserSubscription): 'active' | 'cancelled' | 'expired' {
    if (sub.status === 'cancelled') {
      return 'cancelled';
    }
    if (sub.endDate && sub.endDate.toDate() < new Date()) {
      return 'expired';
    }
    return 'active';
};

export default function AccountPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/patient-login');
        }
    }, [user, isUserLoading, router]);

    const subscriptionsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'users', user.uid, 'subscriptions'), orderBy('startDate', 'desc'));
    }, [firestore, user]);

    const { data: subscriptions, isLoading: subscriptionsLoading } = useCollection<UserSubscription>(subscriptionsQuery);
    
    const activeSubscription = useMemo(() => {
        if (!subscriptions) return null;
        return subscriptions.find(sub => getSubscriptionStatus(sub) === 'active');
    }, [subscriptions]);

    const subscriptionHistory = useMemo(() => {
        if (!subscriptions) return [];
        return subscriptions.filter(sub => getSubscriptionStatus(sub) !== 'active');
    }, [subscriptions]);


    if (isUserLoading || !user) {
        return <AccountLoadingSkeleton />;
    }

    return (
        <div className="container py-12 md:py-20">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-12">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'P'}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold">{user.displayName || 'Welcome'}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Subscription</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {subscriptionsLoading ? <Skeleton className="h-20 w-full" /> : (
                            activeSubscription ? (
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-muted p-4 rounded-lg">
                                    <div>
                                        <h3 className="font-bold text-lg">{activeSubscription.planName}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Active until {format(activeSubscription.endDate.toDate(), 'PPP')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">${activeSubscription.price.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                                         <Badge variant="success" className="capitalize mt-1">Active</Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">You do not have an active subscription.</p>
                                    <Button asChild>
                                        <Link href="/subscription">View Plans</Link>
                                    </Button>
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>A record of your past subscriptions and payments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {subscriptionsLoading ? <Skeleton className="h-40 w-full" /> : (
                            subscriptionHistory.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Period</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subscriptionHistory.map(sub => {
                                            const status = getSubscriptionStatus(sub);
                                            return (
                                                <TableRow key={sub.id}>
                                                    <TableCell className="font-medium">{sub.planName}</TableCell>
                                                    <TableCell>
                                                         <Badge variant={status === 'expired' ? 'secondary' : 'destructive'} className="capitalize">{status}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(sub.startDate.toDate(), 'MMM d, yyyy')} - {format(sub.endDate.toDate(), 'MMM d, yyyy')}
                                                    </TableCell>
                                                    <TableCell className="text-right">${sub.price.toFixed(2)}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center py-8 text-muted-foreground">No past transactions found.</p>
                            )
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
