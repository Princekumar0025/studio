'use server';

/**
 * @fileOverview A physiotherapy condition summarization AI agent.
 *
 * - summarizeCondition - A function that generates summaries of physiotherapy conditions.
 * - SummarizeConditionInput - The input type for the summarizeCondition function.
 * - SummarizeConditionOutput - The return type for the summarizeCondition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeConditionInputSchema = z.object({
  conditionName: z.string().describe('The name of the physiotherapy condition to summarize.'),
});
export type SummarizeConditionInput = z.infer<typeof SummarizeConditionInputSchema>;

const SummarizeConditionOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the physiotherapy condition, including common symptoms, causes, and treatment options.'),
});
export type SummarizeConditionOutput = z.infer<typeof SummarizeConditionOutputSchema>;

export async function summarizeCondition(input: SummarizeConditionInput): Promise<SummarizeConditionOutput> {
  return summarizeConditionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeConditionPrompt',
  input: {schema: SummarizeConditionInputSchema},
  output: {schema: SummarizeConditionOutputSchema},
  prompt: `You are an expert physiotherapist specializing in explaining conditions to patients.\n\nProvide a concise summary of the following physiotherapy condition, including common symptoms, causes, and treatment options.  Keep it short and easy to understand for the general public.\n\nCondition Name: {{{conditionName}}}`,
});

const summarizeConditionFlow = ai.defineFlow(
  {
    name: 'summarizeConditionFlow',
    inputSchema: SummarizeConditionInputSchema,
    outputSchema: SummarizeConditionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
