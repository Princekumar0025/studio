'use client';

import { ContactForm } from './_components/contact-form';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type ContactInfo = {
    email: string;
    phone: string;
    address: string;
}

function ContactDetails() {
    const firestore = useFirestore();
    const docRef = useMemoFirebase(() => firestore ? doc(firestore, 'contactInformation', 'main') : null, [firestore]);
    const { data: contactInfo, isLoading } = useDoc<ContactInfo>(docRef);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <Skeleton className="h-5 w-56" />
                </div>
                 <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <Skeleton className="h-5 w-40" />
                </div>
                 <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    <Skeleton className="h-5 w-72" />
                </div>
            </div>
        )
    }
    
    if (!contactInfo) {
        return (
             <div className="space-y-4 text-muted-foreground">
                <p>Contact information is not available at the moment.</p>
             </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-primary" />
                <a href={`mailto:${contactInfo.email}`} className="text-muted-foreground hover:text-primary transition-colors">{contactInfo.email}</a>
            </div>
            <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-primary" />
                <a href={`tel:${contactInfo.phone}`} className="text-muted-foreground hover:text-primary transition-colors">{contactInfo.phone}</a>
            </div>
            <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-muted-foreground">{contactInfo.address}</span>
            </div>
        </div>
    )
}


export default function ContactPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Get In Touch</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have a question or need more information? We're here to help. Reach out to us via the form, or contact us directly.
            </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          <div className="space-y-6">
             <h2 className="font-headline text-3xl font-bold">Our Office</h2>
             <ContactDetails />
          </div>
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
