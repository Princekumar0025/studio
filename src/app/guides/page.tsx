import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { treatmentGuides } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function GuidesPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Treatment Guides</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Follow these expert-guided exercises to aid your recovery at home. Remember to perform each movement carefully and stop if you feel sharp pain.
        </p>
      </div>

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
    </div>
  );
}
