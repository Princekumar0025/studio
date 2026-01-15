import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { therapists } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

export default function TeamPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Meet Our Experts</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Our team of highly qualified and compassionate therapists is here to guide you on your journey to recovery and wellness.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {therapists.map((therapist, index) => {
          const image = PlaceHolderImages.find(p => p.id === therapist.imageId);
          const isReversed = index % 2 !== 0;
          return (
            <Card key={therapist.id} className="overflow-hidden shadow-lg border-2">
              <div className={`grid md:grid-cols-5 items-center`}>
                <div className={`md:col-span-2 relative w-full h-80 md:h-full ${isReversed ? 'md:order-last' : ''}`}>
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={therapist.name}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                    />
                  )}
                </div>
                <div className="md:col-span-3 p-8 md:p-12">
                  <CardHeader className="p-0">
                    <CardTitle className="font-headline text-3xl">{therapist.name}</CardTitle>
                    <CardDescription className="text-primary font-bold text-md pt-1">{therapist.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 mt-4">
                    <p className="text-muted-foreground">{therapist.bio}</p>
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Specializations:</h4>
                      <div className="flex flex-wrap gap-2">
                        {therapist.specializations.map(spec => (
                          <Badge key={spec} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
