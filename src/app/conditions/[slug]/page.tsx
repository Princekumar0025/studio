'use client';

import { notFound } from 'next/navigation';
import { summarizeCondition, SummarizeConditionOutput } from '@/ai/flows/ai-condition-summaries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Condition = {
  id: string;
  name: string;
  slug: string;
  description: string;
  treatmentOptions: string;
};

type ConditionPageProps = {
  params: {
    slug: string;
  };
};

function ConditionSummary({ conditionName }: { conditionName: string }) {
  const [summary, setSummary] = useState<SummarizeConditionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getSummary() {
      setIsLoading(true);
      const summaryResult = await summarizeCondition({ conditionName });
      setSummary(summaryResult);
      setIsLoading(false);
    }
    getSummary();
  }, [conditionName]);

  if (isLoading || !summary) {
     return (
        <div className="pt-6 space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-6 w-1/4 mt-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
        </div>
     )
  }
  
  const formattedSummary = summary.summary
    .split('\n')
    .filter(line => line.trim() !== '')
    .map((line, index) => {
      if (line.startsWith('Common Symptoms:') || line.startsWith('Causes:') || line.startsWith('Treatment Options:')) {
        return <h3 key={index} className="font-headline text-xl font-bold mt-6 mb-2">{line.replace(':', '')}</h3>;
      }
      return <p key={index} className="mb-4 text-muted-foreground">{line}</p>;
    });
  
  return (
    <CardContent className="p-0 pt-6">
      <div className="prose prose-blue max-w-none">
        {formattedSummary}
      </div>
    </CardContent>
  );
}

function PageContent({ slug }: { slug: string }) {
    const firestore = useFirestore();

    const conditionQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'conditions'), where('slug', '==', slug));
    }, [firestore, slug]);

    const { data: conditions, isLoading } = useCollection<Condition>(conditionQuery);
    const condition = conditions?.[0];

    if (isLoading) {
        return (
             <div className="container py-12 md:py-20">
                <div className="max-w-3xl mx-auto">
                    <Skeleton className="h-12 w-3/4 mb-8" />
                    <Skeleton className="h-24 w-full mb-8" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    if (!condition && !isLoading) {
        notFound();
    }

    if (!condition) return null;

    return (
        <div className="container py-12 md:py-20">
            <div className="max-w-3xl mx-auto">
                <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">{condition.name}</h1>
                
                <Alert className="mb-8 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-700" />
                <AlertTitle className="text-blue-800 font-bold">For Informational Purposes Only</AlertTitle>
                <AlertDescription className="text-blue-700">
                    This information is not a substitute for professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.
                </AlertDescription>
                </Alert>

                <Card className="p-6 md:p-8 shadow-lg border-2">
                    <CardHeader className="p-0">
                        <CardTitle className="font-headline text-2xl text-primary">Condition Overview</CardTitle>
                    </CardHeader>
                    <ConditionSummary conditionName={condition.name} />
                </Card>
            </div>
        </div>
    );
}

export default function ConditionPage({ params }: ConditionPageProps) {
  return <PageContent slug={params.slug} />;
}
