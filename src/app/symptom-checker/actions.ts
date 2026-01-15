"use server";

import { suggestExercise } from "@/ai/flows/ai-suggest-exercise";
import { z } from "zod";

const schema = z.object({
  painDescription: z.string().min(10, "Please describe your symptoms in more detail."),
});

type FormState = {
  message: string | null;
  suggestions: string | null;
  error: boolean;
};

export async function getExerciseSuggestions(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    painDescription: formData.get('painDescription'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.painDescription?.[0] || "Invalid input.",
      suggestions: null,
      error: true,
    };
  }

  try {
    const result = await suggestExercise({ painDescription: validatedFields.data.painDescription });
    return {
      message: "Here are some suggestions based on your description.",
      suggestions: result.suggestedExercises,
      error: false,
    };
  } catch (e) {
    console.error(e);
    return {
      message: "An error occurred while getting suggestions. Please try again later.",
      suggestions: null,
      error: true,
    };
  }
}
