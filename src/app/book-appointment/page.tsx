import { BookingForm } from "./_components/booking-form";

export default function BookAppointmentPage() {
  return (
    <div className="container py-12 md:py-20">
       <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Book an Appointment</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Take the first step towards a pain-free life. Fill out the form below to schedule your consultation with one of our expert physiotherapists.
        </p>
      </div>
      <div className="max-w-2xl mx-auto">
        <BookingForm />
      </div>
    </div>
  )
}
