'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isFeatured: boolean;
};

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

export default function PricingPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const plansCollection = useMemoFirebase(() => firestore ? collection(firestore, 'subscriptionPlans') : null, [firestore]);
  const { data: plans, isLoading } = useCollection<Plan>(plansCollection);

  const handleSubscribe = (planName: string) => {
    toast({
        title: "Thank you for your interest!",
        description: `The "${planName}" subscription is not yet available for online purchase. Please contact us to get started.`,
        duration: 5000,
    })
  }

  const sortedPlans = plans?.sort((a, b) => a.price - b.price);

  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Flexible Plans for Your Needs</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose a plan that fits your recovery goals. Consistent care for better, faster results.
          </p>
        </div>

        {isLoading && <PricingLoadingSkeleton />}

        {!isLoading && sortedPlans && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {sortedPlans.map((plan) => (
                <Card 
                    key={plan.id}
                    className={cn(
                        "flex flex-col h-full border-2",
                        plan.isFeatured ? "border-primary lg:scale-110" : "border-border"
                    )}
                >
                {plan.isFeatured && (
                    <Badge className="absolute -top-3.5 right-6 flex items-center gap-1">
                        <Star className="h-3 w-3" /> Most Popular
                    </Badge>
                )}
                <CardHeader className="p-8">
                    <CardTitle className="font-headline text-2xl text-primary">{plan.name}</CardTitle>
                    <CardDescription className="pt-1 h-10">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-8 pt-0 space-y-6">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                    </div>
                    <ul className="space-y-4 text-sm">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                    </ul>
                </CardContent>
                <CardFooter className="p-8">
                    <Button 
                        size="lg" 
                        className="w-full transition-transform hover:scale-105" 
                        variant={plan.isFeatured ? "default" : "outline"}
                        onClick={() => handleSubscribe(plan.name)}
                    >
                    Get Started
                    </Button>
                </CardFooter>
                </Card>
            ))}
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
