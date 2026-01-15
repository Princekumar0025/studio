"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { getExerciseSuggestions } from "../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

const initialState = {
  message: null,
  suggestions: null,
  error: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Getting Suggestions...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Get Suggestions
        </>
      )}
    </Button>
  );
}

export function SymptomCheckerForm() {
  const [state, formAction] = useFormState(getExerciseSuggestions, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error && state.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    } else if (!state.error && state.suggestions) {
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <>
    <Card className="shadow-lg border-2">
      <form action={formAction} ref={formRef}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Describe Your Symptoms</CardTitle>
          <CardDescription>
            Be as specific as possible. For example: "I have a sharp pain in my lower right back when I bend over," or "My left shoulder feels stiff and aches when I lift my arm overhead."
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="painDescription"
            placeholder="Describe your pain and limitations here..."
            rows={6}
            required
            className="text-base"
          />
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>

    {state.suggestions && !state.error && (
        <Card className="mt-8 shadow-lg border-2">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-primary"/>AI-Generated Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-blue max-w-none text-muted-foreground">
                {state.suggestions.split('\n').filter(line => line.trim() !== '').map((line, i) => <p key={i}>{line}</p>)}
            </CardContent>
        </Card>
      )}
    </>
  );
}
