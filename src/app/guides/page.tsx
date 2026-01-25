'use client';

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type TreatmentGuide = {
  id: string;
  title: string;
  description: string;
  imageId: string;
  slug: string;
};

function GuidesLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-full border-2 flex flex-col justify-between overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <div className="p-6 pt-0 flex justify-end items-center">
                        <Skeleton className="h-5 w-24" />
                    </div>
                </Card>
            ))}
        </div>
    );
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

      {isLoading && <GuidesLoadingSkeleton />}

      {!isLoading && treatmentGuides && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {treatmentGuides.map((guide) => {
                const image = PlaceHolderImages.find((p) => p.id === guide.imageId);
                return (
                    <Link href={`/guides/${guide.slug}`} key={guide.id} className="group">
                        <Card className="h-full border-2 hover:border-primary hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
                            {image && (
                                <div className="relative h-48 w-full">
                                    <Image
                                        src={image.imageUrl}
                                        alt={guide.title}
                                        fill
                                        className="object-cover"
                                        data-ai-hint={image.imageHint}
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="font-headline text-xl">{guide.title}</CardTitle>
                                <CardDescription>{guide.description}</CardDescription>
                            </CardHeader>
                            <div className="p-6 pt-0 mt-auto flex justify-end items-center">
                                <span className="text-sm font-semibold text-primary group-hover:underline">View Guide</span>
                                <ArrowRight className="ml-2 h-4 w-4 text-primary transform transition-transform group-hover:translate-x-1" />
                            </div>
                        </Card>
                    </Link>
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
