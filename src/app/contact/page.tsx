import { ContactForm } from './_components/contact-form';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Get In Touch</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have a question or need more information? We're here to help. Reach out to us via the form, or contact us directly.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:contact@physioguide.com" className="text-muted-foreground hover:text-primary transition-colors">contact@physioguide.com</a>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:123-456-7890" className="text-muted-foreground hover:text-primary transition-colors">(123) 456-7890</a>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">123 Wellness Ave, Health City, ST 12345</span>
              </div>
            </div>
          </div>
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
