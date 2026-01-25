'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Calendar,
  Store,
  DollarSign,
  Sprout,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { seedExampleData } from '@/lib/seed-data';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore not available.',
      });
      return;
    }
    setIsSeeding(true);
    try {
      const { successCount, totalDocs } = await seedExampleData(firestore);
      if (successCount === totalDocs) {
        toast({
          title: 'Success',
          description:
            'Example data for conditions and guides has been added.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Partial Success',
          description: `Added ${successCount} of ${totalDocs} documents. Check console for errors.`,
        });
      }
    } catch (error) {
      console.error('Seeding failed:', error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: 'Could not add example data. See console for details.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Products in store</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to the Admin Panel</CardTitle>
            <CardDescription>
              From here you can manage all aspects of the PhysioGuide website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Use the navigation on the left to manage appointments, doctors,
              the equipment store, and more.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Example Content</CardTitle>
            <CardDescription>
              Add sample data to the Conditions and Treatment Guides sections to
              see how they work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSeedData} disabled={isSeeding}>
              {isSeeding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sprout className="mr-2 h-4 w-4" />
              )}
              {isSeeding ? 'Seeding...' : 'Seed Example Data'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
