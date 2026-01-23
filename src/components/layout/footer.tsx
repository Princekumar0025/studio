'use client';
import Link from "next/link";
import { Twitter, Instagram, Facebook } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Image from "next/image";

type SocialLink = {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram';
  url: string;
}

const socialIcons: { [key in SocialLink['platform']]: React.ComponentType<{ className?: string }> } = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
};

function DynamicSocialLinks() {
    const firestore = useFirestore();
    const socialLinksCollection = useMemoFirebase(() => firestore ? collection(firestore, 'socialLinks') : null, [firestore]);
    const { data: socialLinks, isLoading } = useCollection<SocialLink>(socialLinksCollection);

    if (isLoading) {
        return (
            <div className="flex gap-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
            </div>
        );
    }

    if (!socialLinks || socialLinks.length === 0) {
        return null;
    }
    
    // Ensure we only render one of each platform, just in case.
    const uniquePlatforms = Array.from(new Map(socialLinks.map(link => [link.platform, link])).values());

    return (
        <div className="flex gap-4">
            {uniquePlatforms.map((link) => {
                const Icon = socialIcons[link.platform];
                if (!Icon) return null;
                return (
                    <Link key={link.id} href={link.url} aria-label={link.platform} target="_blank" rel="noopener noreferrer">
                        <Icon className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    </Link>
                );
            })}
        </div>
    );
}

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
             <Link href="/" className="flex items-center gap-3">
                <Image src="https://i.ibb.co/yYvK2g5/physiotherapy-logo-removebg-preview.png" alt="Manual Physiotherapy Logo" width={40} height={40} />
                <span className="text-xl font-bold font-headline">
                    <span className="text-primary">Manual</span> <span className="text-foreground">Physiotherapy</span>
                </span>
            </Link>
            <p className="text-sm text-muted-foreground">Expert manual physiotherapy for sports injury and rehabilitation.</p>
            <DynamicSocialLinks />
          </div>
          <div className="md:col-start-3 flex flex-col gap-2">
            <h4 className="font-headline font-semibold">Quick Links</h4>
            <Link href="/conditions" className="text-sm text-muted-foreground hover:text-primary transition-colors">Conditions</Link>
            <Link href="/guides" className="text-sm text-muted-foreground hover:text-primary transition-colors">Treatment Guides</Link>
            <Link href="/team" className="text-sm text-muted-foreground hover:text-primary transition-colors">Our Team</Link>
            <Link href="/store" className="text-sm text-muted-foreground hover:text-primary transition-colors">Store</Link>
            <Link href="/subscription" className="text-sm text-muted-foreground hover:text-primary transition-colors">Subscription</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-headline font-semibold">Support</h4>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
            <Link href="/book-appointment" className="text-sm text-muted-foreground hover:text-primary transition-colors">Book an Appointment</Link>
            <Link href="/feedback" className="text-sm text-muted-foreground hover:text-primary transition-colors">Feedback</Link>
            <Link href="/account" className="text-sm text-muted-foreground hover:text-primary transition-colors">Patient Portal</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Admin Login</Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Manual Physiotherapy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
