import { FeedbackForm } from './_components/feedback-form';

export default function FeedbackPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                 <h1 className="font-headline text-4xl md:text-5xl font-bold">Share Your Experience</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Your feedback helps us improve our services. Please let us know how we did.
                </p>
            </div>
            <FeedbackForm />
        </div>
      </div>
    </div>
  );
}

    