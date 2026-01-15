"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/conditions", label: "Conditions" },
  { href: "/guides", label: "Treatment Guides" },
  { href: "/team", label: "Our Team" },
  { href: "/symptom-checker", label: "Symptom Checker" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname === href ? "text-primary" : "text-muted-foreground"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold">PhysioGuide</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild>
            <Link href="/book-appointment">Book Appointment</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="mr-6 flex items-center gap-2 mb-8">
                 <Stethoscope className="h-6 w-6 text-primary" />
                 <span className="font-headline text-xl font-bold">PhysioGuide</span>
              </Link>
              <nav className="grid gap-6 text-lg font-medium">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "transition-colors hover:text-foreground",
                      pathname === link.href ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
