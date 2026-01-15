import { notFound } from 'next/navigation';
import { summarizeCondition } from '@/ai/flows/ai-condition-summaries';
import { conditions } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import React from 'react';

type ConditionPageProps = {
  params: {
    slug: string;
  };
};

async function ConditionSummary({ conditionName }: { conditionName: string }) {
  const summaryResult = await summarizeCondition({ conditionName });
  
  const formattedSummary = summaryResult.summary
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


export default async function ConditionPage({ params }: ConditionPageProps) {
  const { slug } = params;
  const condition = conditions.find(c => c.slug === slug);

  if (!condition) {
    notFound();
  }

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
            <React.Suspense fallback={<div className="pt-6"><p className="text-muted-foreground">Generating summary...</p></div>}>
              <ConditionSummary conditionName={condition.name} />
            </React.Suspense>
        </Card>
      </div>
    </div>
  );
}
