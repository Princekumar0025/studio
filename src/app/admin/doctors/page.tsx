import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function DoctorsAdminPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Doctors</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Doctors List</CardTitle>
          <CardDescription>
            A list of all doctors in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Doctor management interface will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
