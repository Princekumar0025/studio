'use client';

import { useRouter } from 'next/navigation';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser
} from '@/firebase';
import { collection, Timestamp, query } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import Image from 'next/image';

type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isFeatured: boolean;
  durationInDays: number;
  imageUrl?: string;
  videoUrl?: string;
  content?: string;
};

type UserSubscription = {
  id: string;
  planId: string;
  status: 'active' | 'cancelled';
  endDate: Timestamp;
}

function PricingLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="flex flex-col">
                    <CardHeader className="p-6">
                        <Skeleton className="h-7 w-40 mb-2" />
                        <Skeleton className="h-5 w-full" />
                    </CardHeader>
                    <CardContent className="flex-1 p-6 space-y-4">
                        <Skeleton className="h-10 w-24" />
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-5/6" />
                            <Skeleton className="h-5 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter className="p-6">
                        <Skeleton className="h-11 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

export default function SubscriptionPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const plansCollection = useMemoFirebase(() => firestore ? collection(firestore, 'subscriptionPlans') : null, [firestore]);
  const { data: plans, isLoading: plansLoading } = useCollection<Plan>(plansCollection);
  
  const userSubscriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'subscriptions'));
  }, [firestore, user]);

  const { data: userSubscriptions, isLoading: subscriptionsLoading } = useCollection<UserSubscription>(userSubscriptionsQuery);

  const activeSubscription = useMemo(() => {
    if (!userSubscriptions || userSubscriptions.length === 0) {
      return null;
    }
    // Find an active subscription that has not expired
    const now = new Date();
    return userSubscriptions.find(sub => 
        sub.status === 'active' && 
        sub.endDate && 
        sub.endDate.toDate() > now
    ) || null;
  }, [userSubscriptions]);

  const handleSubscribe = (plan: Plan) => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/patient-login?redirect=/subscription');
      return;
    }

    if (activeSubscription) {
        toast({
            title: "You're already subscribed",
            description: `You already have an active subscription. Manage it in your account page.`
        });
        return;
    }
    
    router.push(`/subscription/checkout/${plan.id}`);
  }

  const isLoading = plansLoading || isUserLoading || subscriptionsLoading;
  const sortedPlans = plans?.sort((a, b) => a.price - b.price);

  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Subscription Plans</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose a plan that fits your recovery goals. Consistent care for better, faster results.
          </p>
        </div>

        {isLoading && <PricingLoadingSkeleton />}

        {!isLoading && sortedPlans && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
            {sortedPlans.map((plan) => {
                const isCurrentPlan = activeSubscription?.planId === plan.id;
                const hasActiveSub = !!activeSubscription;

                return (
                    <Card 
                        key={plan.id}
                        className={cn(
                            "flex flex-col h-full shadow-lg border-2 transition-all overflow-hidden",
                            plan.isFeatured && !hasActiveSub ? "border-primary scale-105 bg-card" : "border-border",
                            isCurrentPlan && "border-green-500"
                        )}
                    >
                    {plan.imageUrl && (
                        <div className="relative h-48 w-full">
                            <Image src={plan.imageUrl} alt={plan.name} fill className="object-cover" />
                        </div>
                    )}
                    {(plan.isFeatured && !hasActiveSub) && (
                        <Badge className="absolute -top-3 right-4 flex items-center gap-1">
                            <Star className="h-3 w-3" /> Most Popular
                        </Badge>
                    )}
                     {isCurrentPlan && (
                        <Badge variant="secondary" className="absolute -top-3 right-4 border border-green-500 text-green-600">
                            Current Plan
                        </Badge>
                    )}
                    <CardHeader className="p-6">
                        <CardTitle className="font-headline text-2xl text-primary">{plan.name}</CardTitle>
                        <CardDescription className="pt-1">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-6 space-y-6">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">${plan.price}</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                        <ul className="space-y-3 text-sm">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                    <CardFooter className="p-6">
                        <Button 
                            size="lg" 
                            className="w-full" 
                            variant={isCurrentPlan ? "outline" : (plan.isFeatured ? "default" : "outline")}
                            onClick={() => handleSubscribe(plan)}
                            disabled={hasActiveSub}
                        >
                        {isCurrentPlan ? "Your Active Plan" : (hasActiveSub ? "Plan Already Active" : "Get Started")}
                        </Button>
                    </CardFooter>
                    </Card>
                )
            })}
            </div>
        )}

         {!isLoading && !sortedPlans?.length && (
            <div className="text-center text-muted-foreground py-8 max-w-4xl mx-auto">
                <p>Subscription plans are not available at this time. Please check back later.</p>
            </div>
        )}
      </div>
    </div>
  );
}
    
