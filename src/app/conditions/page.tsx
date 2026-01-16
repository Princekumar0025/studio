'use client';

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Condition = {
  id: string;
  name: string;
  slug: string;
}

function ConditionsLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-full border-2 flex flex-col justify-between">
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <div className="p-6 pt-0 flex justify-end items-center">
                        <Skeleton className="h-5 w-24" />
                    </div>
                </Card>
            ))}
        </div>
    );
}

export default function ConditionsPage() {
  const firestore = useFirestore();
  const conditionsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'conditions') : null, [firestore]);
  const { data: conditions, isLoading } = useCollection<Condition>(conditionsCollection);

  return (
    <div className="container py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Condition Library</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Learn more about common conditions we treat. Our goal is to empower you with knowledge about your body and your health.
        </p>
      </div>
      
      {isLoading && <ConditionsLoadingSkeleton />}

      {!isLoading && conditions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {conditions.map((condition) => (
            <Link href={`/conditions/${condition.slug}`} key={condition.slug} className="group">
                <Card className="h-full border-2 hover:border-primary hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">{condition.name}</CardTitle>
                </CardHeader>
                <div className="p-6 pt-0 flex justify-end items-center">
                    <span className="text-sm font-semibold text-primary group-hover:underline">Learn More</span>
                    <ArrowRight className="ml-2 h-4 w-4 text-primary transform transition-transform group-hover:translate-x-1" />
                </div>
                </Card>
            </Link>
            ))}
        </div>
      )}
      
      {!isLoading && !conditions?.length && (
         <div className="text-center text-muted-foreground py-8">
            <p>No conditions have been added to the library yet. Please check back later.</p>
        </div>
      )}
    </div>
  );
}
