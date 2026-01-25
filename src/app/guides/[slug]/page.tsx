'use client';

import { notFound } from 'next/navigation';
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
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
  slug: string;
  steps: GuideStep[];
};

type GuidePageProps = {
  params: {
    slug: string;
  };
};

function GuideContent({ slug }: { slug: string }) {
    const firestore = useFirestore();
    const guideQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'treatmentGuides'), where('slug', '==', slug));
    }, [firestore, slug]);
    const { data: guides, isLoading } = useCollection<TreatmentGuide>(guideQuery);
    const guide = guides?.[0];

    if (isLoading) {
        return (
             <div className="container py-12 md:py-20">
                <div className="max-w-4xl mx-auto">
                    <Skeleton className="h-64 w-full" />
                    <div className="mt-8">
                        <Skeleton className="h-10 w-3/4 mb-4" />
                        <Skeleton className="h-5 w-full mb-8" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (!guide) {
        notFound();
    }
    
    const image = PlaceHolderImages.find((p) => p.id === guide.imageId);

    return (
        <div className="container py-12 md:py-20">
            <div className="max-w-4xl mx-auto">
                 <Card key={guide.id} className="overflow-hidden shadow-lg border-2">
                    <div className="relative h-64 md:h-96 w-full">
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
                    <CardHeader className="p-6 md:p-8">
                        <CardTitle className="font-headline text-3xl md:text-4xl">{guide.title}</CardTitle>
                        <CardDescription className="pt-2 text-lg">{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 md:p-8 pt-0">
                        <Accordion type="single" collapsible className="w-full">
                        {guide.steps.map((step, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="font-semibold text-left text-lg">
                                Step {index + 1}: {step.title}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base">
                                {step.instructions}
                            </AccordionContent>
                            </AccordionItem>
                        ))}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function GuidePage({ params }: GuidePageProps) {
    return <GuideContent slug={params.slug} />;
}
