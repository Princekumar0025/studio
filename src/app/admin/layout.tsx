'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  Store,
  Calendar,
  Stethoscope,
  PanelLeft,
  Activity,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import React, { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { href: '/admin/doctors', label: 'Doctors', icon: Users },
  { href: '/admin/store', label: 'Store', icon: Store },
  { href: '/admin/conditions', label: 'Conditions', icon: Activity },
  { href: '/admin/guides', label: 'Guides', icon: BookOpen },
];

function AdminHeader() {
  const { toggleSidebar, openMobile } = useSidebar();
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="outline"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={toggleSidebar}
        aria-label={openMobile ? "Close navigation menu" : "Open navigation menu"}
      >
        <PanelLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1">
        <h1 className="text-lg font-semibold">Admin Panel</h1>
      </div>
    </header>
  );
}

function AdminLoading() {
    return (
        <div className="flex min-h-screen">
            <div className="hidden md:block w-64 p-4 border-r">
                <Skeleton className="h-10 w-40 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
            <div className="flex-1 p-6">
                <Skeleton className="h-8 w-48 mb-6" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  if (isUserLoading) {
      return <AdminLoading />;
  }

  if (!user) {
      return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <Link href="/admin/dashboard" className="flex items-center gap-2 p-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl font-bold">PhysioGuide</span>
            </Link>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))}
                    tooltip={{children: item.label}}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
