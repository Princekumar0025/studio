'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { therapists } from '@/lib/data'; // Using mock data for now
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// In a real app, this would come from and be saved to your database
const initialAvailability: Record<string, string[]> = {
  'caleb-burgess': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
  'jane-doe': ['09:30', '10:30', '11:30', '14:30', '15:30'],
};

export default function AppointmentsAdminPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTherapist, setSelectedTherapist] = useState<string>(therapists[0].id);
  const [availability, setAvailability] = useState<Record<string, string[]>>(initialAvailability);
  const [newTime, setNewTime] = useState('');
  const { toast } = useToast();

  const handleAddTime = () => {
    if (newTime && selectedTherapist) {
      if (!/^\d{2}:\d{2}$/.test(newTime)) {
        toast({
            variant: "destructive",
            title: "Invalid Time Format",
            description: "Please use HH:MM format (e.g., 14:30).",
        });
        return;
      }

      if (availability[selectedTherapist]?.includes(newTime)) {
          toast({
              variant: "destructive",
              title: "Time Slot Exists",
              description: `The time slot ${newTime} is already available.`,
          });
          return;
      }

      const updatedSlots = [...(availability[selectedTherapist] || []), newTime].sort();
      setAvailability({
        ...availability,
        [selectedTherapist]: updatedSlots,
      });

      toast({
          title: "Time Slot Added",
          description: `Added ${newTime} to ${therapists.find(t => t.id === selectedTherapist)?.name}'s availability.`,
      });
      setNewTime('');
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (selectedTherapist) {
      setAvailability({
        ...availability,
        [selectedTherapist]: availability[selectedTherapist].filter(t => t !== timeToRemove),
      });
      toast({
          variant: "destructive",
          title: "Time Slot Removed",
          description: `Removed ${timeToRemove} from ${therapists.find(t => t.id === selectedTherapist)?.name}'s availability.`,
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Appointments & Availability</h1>
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-6">
            <Card>
            <CardHeader>
                <CardTitle>Appointments Calendar</CardTitle>
                <CardDescription>
                Select a date to view scheduled appointments.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(day) => day < new Date(new Date().setHours(0,0,0,0))}
                />
            </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appointments for {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '...'}</CardTitle>
                    <CardDescription>
                        A list of appointments scheduled for the selected day.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <p>Appointment booking data not yet connected.</p>
                        <p className="text-sm">In the future, appointments for the selected date will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div>
            <Card>
            <CardHeader>
                <CardTitle>Doctor Availability</CardTitle>
                <CardDescription>Set available time slots for each doctor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="therapist-select">Select Doctor</Label>
                    <Select value={selectedTherapist} onValueChange={setSelectedTherapist}>
                        <SelectTrigger id="therapist-select">
                        <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                        {therapists.map(therapist => (
                            <SelectItem key={therapist.id} value={therapist.id}>{therapist.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-2">
                    <Label>Available Time Slots</Label>
                     <div className="space-y-2 max-h-60 overflow-y-auto rounded-md border p-2">
                        {availability[selectedTherapist]?.length > 0 ? (
                            availability[selectedTherapist].map(time => (
                                <div key={time} className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
                                    <span>{time}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveTime(time)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Remove {time}</span>
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No time slots configured.</p>
                        )}
                     </div>
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="new-time">Add Time Slot</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="new-time"
                            type="time" 
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                         />
                        <Button onClick={handleAddTime} disabled={!newTime}><PlusCircle className="h-4 w-4 mr-2" /> Add</Button>
                    </div>
                 </div>
                 <CardDescription className="text-xs pt-2">Note: This is a demo. Availability changes are not saved.</CardDescription>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
