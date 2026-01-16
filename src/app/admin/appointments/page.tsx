'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
  FirestorePermissionError,
  errorEmitter
} from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

type Therapist = { id: string; name: string };
type Appointment = { id: string; patientName: string; appointmentDateTime: string; };
type Availability = { timeSlots: string[] };

export default function AppointmentsAdminPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTherapist, setSelectedTherapist] = useState<string | undefined>();
  const [newTime, setNewTime] = useState('');
  
  const { toast } = useToast();
  const firestore = useFirestore();

  // Fetch therapists
  const therapistsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'therapists') : null, [firestore]);
  const { data: therapists, isLoading: therapistsLoading } = useCollection<Therapist>(therapistsCollection);

  // Set default therapist once loaded
  useEffect(() => {
    if (therapists && therapists.length > 0 && !selectedTherapist) {
      setSelectedTherapist(therapists[0].id);
    }
  }, [therapists, selectedTherapist]);

  // Derived state for Firestore queries
  const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;

  // Fetch availability for the selected therapist and date
  const availabilityDocRef = useMemoFirebase(() => {
    if (!firestore || !selectedTherapist || !formattedDate) return null;
    return doc(firestore, 'therapists', selectedTherapist, 'availability', formattedDate);
  }, [firestore, selectedTherapist, formattedDate]);
  const { data: availabilityData, isLoading: availabilityLoading } = useDoc<Availability>(availabilityDocRef);
  
  const sortedSlots = useMemo(() => {
    if (!availabilityData?.timeSlots) return [];
    return [...availabilityData.timeSlots].sort();
  }, [availabilityData]);

  // Fetch appointments for the selected therapist and date
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedTherapist || !date) return null;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentsCollectionRef = collection(firestore, 'therapists', selectedTherapist, 'appointments');
    return query(
        appointmentsCollectionRef,
        where('appointmentDateTime', '>=', startOfDay.toISOString()),
        where('appointmentDateTime', '<=', endOfDay.toISOString())
    );
  }, [firestore, selectedTherapist, date]);
  const { data: appointments, isLoading: appointmentsLoading } = useCollection<Appointment>(appointmentsQuery);

  const sortedAppointments = useMemo(() => {
    if (!appointments) return [];
    return [...appointments].sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime());
  }, [appointments]);

  const handleAddTime = () => {
    if (!availabilityDocRef || !newTime) return;
    if (!/^\d{2}:\d{2}$/.test(newTime)) {
      toast({ variant: "destructive", title: "Invalid Time Format", description: "Please use HH:MM format (e.g., 14:30)." });
      return;
    }
    if (sortedSlots.includes(newTime)) {
      toast({ variant: "destructive", title: "Time Slot Exists" });
      return;
    }

    const operation = availabilityData ? 
      updateDoc(availabilityDocRef, { timeSlots: arrayUnion(newTime) }) :
      setDoc(availabilityDocRef, { timeSlots: [newTime] });

    operation.then(() => {
      toast({ title: "Time Slot Added" });
      setNewTime('');
    }).catch(error => {
      const permissionError = new FirestorePermissionError({
        path: availabilityDocRef.path,
        operation: availabilityData ? 'update' : 'create',
        requestResourceData: { timeSlots: arrayUnion(newTime) }
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (!availabilityDocRef) return;
    updateDoc(availabilityDocRef, { timeSlots: arrayRemove(timeToRemove) })
      .then(() => {
        toast({ variant: 'destructive', title: 'Time Slot Removed' });
      }).catch(error => {
        const permissionError = new FirestorePermissionError({
          path: availabilityDocRef.path,
          operation: 'update',
          requestResourceData: { timeSlots: arrayRemove(timeToRemove) }
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };
  
  const selectedTherapistName = therapists?.find(t => t.id === selectedTherapist)?.name;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Appointments & Availability</h1>
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointments Calendar</CardTitle>
              <CardDescription>Select a date to view schedules and manage availability.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Appointments for {date ? format(date, 'PPP') : '...'}</CardTitle>
              <CardDescription>
                Appointments scheduled for {selectedTherapistName || '...'} on the selected day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading && <Skeleton className="h-20 w-full" />}
              {!appointmentsLoading && sortedAppointments && sortedAppointments.length > 0 && (
                <div className="space-y-2">
                  {sortedAppointments.map(app => (
                    <div key={app.id} className="flex items-center justify-between bg-muted p-3 rounded-md">
                      <div className="font-semibold">{app.patientName}</div>
                      <div>{format(new Date(app.appointmentDateTime), 'p')}</div>
                    </div>
                  ))}
                </div>
              )}
              {!appointmentsLoading && (!sortedAppointments || sortedAppointments.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No appointments scheduled for this day.</p>
                </div>
              )}
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
                {therapistsLoading ? <Skeleton className="h-10 w-full" /> : (
                  <Select value={selectedTherapist} onValueChange={setSelectedTherapist}>
                    <SelectTrigger id="therapist-select">
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {therapists?.map(therapist => (
                        <SelectItem key={therapist.id} value={therapist.id}>{therapist.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Available Time Slots for {formattedDate}</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto rounded-md border p-2">
                  {availabilityLoading ? <Skeleton className="h-20 w-full" /> : (
                    sortedSlots.length > 0 ? (
                      sortedSlots.map(time => (
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
                    )
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
                  <Button onClick={handleAddTime} disabled={!newTime || availabilityLoading}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
