import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { conditions } from "@/lib/data";
import { ArrowRight } from "lucide-react";

export default function ConditionsPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Condition Library</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Learn more about common conditions we treat. Our goal is to empower you with knowledge about your body and your health.
        </p>
      </div>

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
    </div>
  );
}
