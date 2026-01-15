import { SymptomCheckerForm } from "./_components/symptom-checker-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function SymptomCheckerPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">AI Exercise Suggester</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Describe your pain or movement limitations, and our AI will suggest some potential exercises that may help.
          </p>
        </div>

        <Alert variant="destructive" className="mb-8">
          <Info className="h-4 w-4" />
          <AlertTitle className="font-bold">Disclaimer: Not Medical Advice</AlertTitle>
          <AlertDescription>
            This tool provides suggestions for informational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </AlertDescription>
        </Alert>

        <SymptomCheckerForm />
      </div>
    </div>
  );
}
