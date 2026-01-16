"use client";

import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  useFirestore,
  useCollection,
  useDoc,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import {
  collection,
  doc,
  addDoc,
} from 'firebase/firestore';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

type Therapist = { id: string; name: string };

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  therapistId: z.string().nonempty({ message: "Please select a therapist." }),
  date: z.date({ required_error: "A date is required." }),
  time: z.string().nonempty({ message: "Please select a time." }),
});

export function BookingForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      therapistId: "",
      time: "",
    },
  });

  const selectedTherapistId = form.watch('therapistId');
  const selectedDate = form.watch('date');

  const therapistsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'therapists') : null, [firestore]);
  const { data: therapists, isLoading: therapistsLoading } = useCollection<Therapist>(therapistsCollection);
  
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

  const availabilityDocRef = useMemoFirebase(() => {
    if (!firestore || !selectedTherapistId || !formattedDate) return null;
    return doc(firestore, 'therapists', selectedTherapistId, 'availability', formattedDate);
  }, [firestore, selectedTherapistId, formattedDate]);

  const { data: availabilityData, isLoading: availabilityLoading } = useDoc<{timeSlots: string[]}>(availabilityDocRef);
  
  const availableTimes = useMemo(() => {
    if (!availabilityData?.timeSlots) return [];
    return [...availabilityData.timeSlots].sort();
  }, [availabilityData]);

  // Reset time when date or therapist changes
  useEffect(() => {
    form.resetField('time');
  }, [selectedDate, selectedTherapistId, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    setIsSubmitting(true);
    const [hours, minutes] = values.time.split(':').map(Number);
    const appointmentDateTime = new Date(values.date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const appointmentsCollection = collection(firestore, 'therapists', values.therapistId, 'appointments');
    const newAppointment = {
      patientName: values.name,
      email: values.email,
      phoneNumber: values.phone,
      appointmentDateTime: appointmentDateTime.toISOString(),
      therapistId: values.therapistId,
      status: 'pending',
    };

    addDoc(appointmentsCollection, newAppointment)
      .then(() => {
        toast({
          title: "Appointment Requested!",
          description: `We've received your request for an appointment on ${format(values.date, "PPP")} at ${values.time}. We will contact you shortly to confirm.`,
        });
        form.reset();
      })
      .catch(error => {
        const permissionError = new FirestorePermissionError({
          path: appointmentsCollection.path,
          operation: 'create',
          requestResourceData: newAppointment,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <Card className="p-6 md:p-8 shadow-lg border-2">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="therapistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Therapist</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={therapistsLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={therapistsLoading ? "Loading doctors..." : "Select a therapist"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {therapists?.map(therapist => (
                        <SelectItem key={therapist.id} value={therapist.id}>{therapist.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Appointment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0,0,0,0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} disabled={!selectedTherapistId || !selectedDate || availabilityLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={availabilityLoading ? "Loading times..." : "Select a time"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!availabilityLoading && availableTimes.length > 0 ? (
                           availableTimes.map(time => (
                            <SelectItem key={time} value={time}>{format(new Date(`1970-01-01T${time}`), 'p')}</SelectItem>
                          ))
                        ) : (
                          <div className="text-center text-sm text-muted-foreground p-4">No available times.</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Appointment
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
