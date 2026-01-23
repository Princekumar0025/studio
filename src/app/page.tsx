'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartPulse, Bone, Brain, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";

type Therapist = {
  id: string;
  name: string;
  title: string;
  imageId: string;
  specializations: string[];
};

function MeetTheTeamSection() {
    const firestore = useFirestore();
    const therapistsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'therapists') : null, [firestore]);
    const { data: therapists, isLoading } = useCollection<Therapist>(therapistsCollection);

    if (isLoading) {
        return (
            <div className="mt-12 flex justify-center">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-background rounded-lg max-w-xl">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            </div>
        )
    }

    if (!therapists || therapists.length === 0) {
        return null; // Don't show the section if no therapists
    }
    
    const featuredTherapist = therapists.find(t => t.imageId === 'caleb-burgess') || therapists[0];
    
    if (!featuredTherapist) {
        return null;
    }

    const image = PlaceHolderImages.find(p => p.id === featuredTherapist.imageId);

    return (
        <div className="mt-12 flex justify-center">
            <div key={featuredTherapist.id} className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-background rounded-lg max-w-xl transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                {image && (
                    <Avatar className="h-24 w-24">
                    <AvatarImage src={image.imageUrl} alt={featuredTherapist.name} data-ai-hint={image.imageHint} />
                    <AvatarFallback>{featuredTherapist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                <div className="text-center sm:text-left">
                <h3 className="font-headline text-xl font-bold">{featuredTherapist.name}</h3>
                <p className="text-primary font-semibold">{featuredTherapist.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{featuredTherapist.specializations.join(', ')}</p>
                </div>
            </div>
        </div>
    )
}

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  const services = [
    {
      icon: <HeartPulse className="w-10 h-10 text-primary" />,
      title: "Manual Therapy",
      description: "Hands-on techniques to decrease pain and improve mobility."
    },
    {
      icon: <Bone className="w-10 h-10 text-primary" />,
      title: "Sports Rehabilitation",
      description: "Customized programs to get you back in the game, stronger than before."
    },
    {
      icon: <Brain className="w-10 h-10 text-primary" />,
      title: "Pain Science Education",
      description: "Understand your pain and learn strategies to manage it effectively."
    },
    {
      icon: <UserCheck className="w-10 h-10 text-primary" />,
      title: "Personalized Exercise",
      description: "Tailored exercise plans that fit your life and your goals."
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh]">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt="A friendly physiotherapist smiling."
                fill
                priority
                className="object-cover"
                data-ai-hint="doctor portrait"
            />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container h-full flex flex-col justify-center text-white">
          <h1 className="font-headline text-5xl md:text-7xl font-bold max-w-3xl !leading-tight">
            Move Freely, Live Fully.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-200">
            Expert physiotherapy to help you overcome injury, manage pain, and achieve your physical best.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground transition-transform hover:scale-105">
              <Link href="/book-appointment">
                Book Your Consultation <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-headline text-4xl md:text-5xl font-bold">A Holistic Approach to Wellness</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We offer a range of specialized services designed to address the root cause of your pain and help you build a resilient body.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center flex flex-col items-center p-8 border-2">
                <div className="p-4 bg-primary/10 rounded-full">
                  {service.icon}
                </div>
                <CardHeader className="p-0 pt-6">
                  <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

       {/* Meet the Team Section */}
      <section className="py-20 md:py-28 bg-secondary">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-headline text-4xl md:text-5xl font-bold">Expert Care from Our Specialists</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our team of dedicated professionals is committed to providing you with the highest quality of care.
            </p>
          </div>
          <MeetTheTeamSection />
          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link href="/team">Meet The Whole Team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container text-center">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">Ready to Start Your Recovery?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Don't let pain hold you back. Schedule an appointment today and take the first step towards a healthier, more active life.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild className="transition-transform hover:scale-105">
              <Link href="/book-appointment">
                Book an Appointment Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
