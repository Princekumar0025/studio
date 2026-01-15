'use server';

/**
 * @fileOverview Provides exercise suggestions based on user-described pain and limitations.
 *
 * - suggestExercise - A function to generate exercise suggestions.
 * - SuggestExerciseInput - The input type for the suggestExercise function.
 * - SuggestExerciseOutput - The return type for the suggestExercise function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExerciseInputSchema = z.object({
  painDescription: z
    .string()
    .describe('A description of the user\'s pain and limitations of movement.'),
});
export type SuggestExerciseInput = z.infer<typeof SuggestExerciseInputSchema>;

const SuggestExerciseOutputSchema = z.object({
  suggestedExercises: z
    .string()
    .describe('A list of suggested exercises based on the pain description.'),
});
export type SuggestExerciseOutput = z.infer<typeof SuggestExerciseOutputSchema>;

export async function suggestExercise(input: SuggestExerciseInput): Promise<SuggestExerciseOutput> {
  return suggestExerciseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExercisePrompt',
  input: {schema: SuggestExerciseInputSchema},
  output: {schema: SuggestExerciseOutputSchema},
  prompt: `You are a helpful AI assistant that suggests exercises based on a user's description of their pain and limitations of movement. These suggestions are not medical advice, and the user should consult a healthcare professional for proper diagnosis and treatment.

  User Description: {{{painDescription}}}

  Suggested Exercises:`,
});

const suggestExerciseFlow = ai.defineFlow(
  {
    name: 'suggestExerciseFlow',
    inputSchema: SuggestExerciseInputSchema,
    outputSchema: SuggestExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
