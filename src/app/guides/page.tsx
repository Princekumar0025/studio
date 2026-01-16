'use client';

import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type GuideStep = {
  title: string;
  instructions: string;
};

type TreatmentGuide = {
  id: string;
  title: string;
  description: string;
  imageId: string;
  steps: GuideStep[];
};


function GuideLoadingSkeleton() {
    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            {[...Array(2)].map((_, i) => (
                <Card key={i} className="overflow-hidden shadow-lg border-2">
                    <Skeleton className="h-64 w-full" />
                    <CardHeader className="p-6">
                        <Skeleton className="h-8 w-3/4" />
                    </CardHeader>
                    <CardContent className="px-6 pb-6 space-y-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function GuidesPage() {
  const firestore = useFirestore();
  const guidesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'treatmentGuides') : null, [firestore]);
  const { data: treatmentGuides, isLoading } = useCollection<TreatmentGuide>(guidesCollection);

  return (
    <div className="container py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Treatment Guides</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Follow these expert-guided exercises to aid your recovery at home. Remember to perform each movement carefully and stop if you feel sharp pain.
        </p>
      </div>

      {isLoading && <GuideLoadingSkeleton />}

      {!isLoading && treatmentGuides && (
        <div className="space-y-12 max-w-4xl mx-auto">
            {treatmentGuides.map((guide) => {
            const image = PlaceHolderImages.find((p) => p.id === guide.imageId);
            return (
                <Card key={guide.id} className="overflow-hidden shadow-lg border-2">
                <div className="relative h-64 w-full">
                    {image && (
                    <Image
                        src={image.imageUrl}
                        alt={guide.title}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
                    />
                    )}
                </div>
                <CardHeader className="p-6">
                    <CardTitle className="font-headline text-2xl">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <p className="text-muted-foreground mb-4">{guide.description}</p>
                    <Accordion type="single" collapsible className="w-full">
                    {guide.steps.map((step, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="font-semibold text-left">
                            Step {index + 1}: {step.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {step.instructions}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
                </Card>
            );
            })}
        </div>
      )}

      {!isLoading && !treatmentGuides?.length && (
         <div className="text-center text-muted-foreground py-8 max-w-4xl mx-auto">
            <p>No treatment guides have been published yet. Please check back later.</p>
        </div>
      )}
    </div>
  );
}
