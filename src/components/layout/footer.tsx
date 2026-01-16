import Link from "next/link";
import { Stethoscope, Twitter, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
             <Link href="/" className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl font-bold">PhysioGuide</span>
            </Link>
            <p className="text-sm text-muted-foreground">Your expert partner in pain recovery and physical wellness.</p>
            <div className="flex gap-4">
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
          <div className="md:col-start-3 flex flex-col gap-2">
            <h4 className="font-headline font-semibold">Quick Links</h4>
            <Link href="/conditions" className="text-sm text-muted-foreground hover:text-primary transition-colors">Conditions</Link>
            <Link href="/guides" className="text-sm text-muted-foreground hover:text-primary transition-colors">Treatment Guides</Link>
            <Link href="/team" className="text-sm text-muted-foreground hover:text-primary transition-colors">Our Team</Link>
            <Link href="/store" className="text-sm text-muted-foreground hover:text-primary transition-colors">Store</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-headline font-semibold">Support</h4>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
            <Link href="/book-appointment" className="text-sm text-muted-foreground hover:text-primary transition-colors">Book an Appointment</Link>
            <Link href="/symptom-checker" className="text-sm text-muted-foreground hover:text-primary transition-colors">Symptom Checker</Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PhysioGuide. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
