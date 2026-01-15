import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartPulse, Bone, Brain, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { therapists } from "@/lib/data";

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  const services = [
    {
      icon: <HeartPulse className="w-8 h-8 text-primary" />,
      title: "Manual Therapy",
      description: "Hands-on techniques to decrease pain and improve mobility."
    },
    {
      icon: <Bone className="w-8 h-8 text-primary" />,
      title: "Sports Rehabilitation",
      description: "Customized programs to get you back in the game, stronger than before."
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "Pain Science Education",
      description: "Understand your pain and learn strategies to manage it effectively."
    },
    {
      icon: <UserCheck className="w-8 h-8 text-primary" />,
      title: "Personalized Exercise",
      description: "Tailored exercise plans that fit your life and your goals."
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh]">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
        <div className="relative container h-full flex flex-col justify-end pb-12 md:pb-24 text-white">
          <h1 className="font-headline text-4xl md:text-6xl font-bold max-w-2xl !leading-tight">
            Move Freely, Live Fully. Your Path to Pain-Free Living.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-200">
            Expert physiotherapy to help you overcome injury, manage chronic pain, and achieve your physical best.
          </p>
          <div className="mt-6">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/book-appointment">
                Book Your Consultation <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">A Holistic Approach to Wellness</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We offer a range of specialized services designed to address the root cause of your pain and help you build a resilient body.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center flex flex-col items-center p-6 border-2 hover:border-primary transition-colors hover:shadow-lg">
                <div className="p-4 bg-primary/10 rounded-full">
                  {service.icon}
                </div>
                <CardHeader className="p-0 pt-4">
                  <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

       {/* Meet the Team Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Expert Care from Our Specialists</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our team of dedicated professionals is committed to providing you with the highest quality of care.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {therapists.map(therapist => {
              const image = PlaceHolderImages.find(p => p.id === therapist.imageId);
              return (
                <div key={therapist.id} className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-background rounded-lg shadow-sm">
                  {image && (
                     <Avatar className="h-24 w-24">
                       <AvatarImage src={image.imageUrl} alt={therapist.name} data-ai-hint={image.imageHint} />
                       <AvatarFallback>{therapist.name.charAt(0)}</AvatarFallback>
                     </Avatar>
                  )}
                  <div className="text-center sm:text-left">
                    <h3 className="font-headline text-xl font-bold">{therapist.name}</h3>
                    <p className="text-primary font-semibold">{therapist.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{therapist.specializations.join(', ')}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link href="/team">Meet The Whole Team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">Ready to Start Your Recovery Journey?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Don't let pain hold you back. Schedule an appointment today and take the first step towards a healthier, more active life.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
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
