'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckoutForm } from './_components/checkout-form';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Check } from 'lucide-react';

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

export default function CheckoutPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const params = useParams();
    const planId = params.planId as string;

    const firestore = useFirestore();
    const planRef = useMemoFirebase(() => {
        if (!firestore || !planId) return null;
        return doc(firestore, 'subscriptionPlans', planId);
    }, [firestore, planId]);

    const { data: plan, isLoading: isPlanLoading } = useDoc<Plan>(planRef);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push(`/patient-login?redirect=/subscription/checkout/${planId}`);
        }
    }, [isUserLoading, user, router, planId]);


    if (isUserLoading || isPlanLoading || !user) {
        return (
            <div className="container py-12 md:py-20">
                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    <div>
                        <Skeleton className="h-8 w-1/2 mb-4" />
                        <Skeleton className="h-4 w-3/4 mb-8" />
                         <Skeleton className="h-48 w-full" />
                    </div>
                     <div>
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        )
    }
    
    if (!plan) {
        return (
             <div className="container py-12 md:py-20 text-center">
                <h1 className="text-2xl font-bold">Plan not found</h1>
                <p className="text-muted-foreground">The subscription plan you are looking for does not exist.</p>
            </div>
        )
    }

    return (
        <div className="container py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto items-start">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle>Review Your Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-bold text-lg text-primary">{plan.name}</p>
                            <p className="text-4xl font-bold mt-2">${plan.price}<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                            <ul className="mt-6 space-y-3 text-sm">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                 <div>
                    <CheckoutForm plan={plan} user={user} />
                </div>
            </div>
        </div>
    );
}
