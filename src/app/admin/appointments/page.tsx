import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AppointmentsAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Appointments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Appointments Calendar</CardTitle>
          <CardDescription>
            View and manage all appointments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Appointment management interface will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
