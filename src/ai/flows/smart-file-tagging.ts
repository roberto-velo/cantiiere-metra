'use server';
/**
 * @fileOverview This file defines a Genkit flow for smart file tagging.
 *
 * - smartFileTagging - A function that suggests context-aware categories for files.
 * - SmartFileTaggingInput - The input type for the smartFileTagging function.
 * - SmartFileTaggingOutput - The return type for the smartFileTagging function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartFileTaggingInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file to be tagged, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  context: z.string().describe('The context of the file, e.g., job description, client name, etc.'),
});
export type SmartFileTaggingInput = z.infer<typeof SmartFileTaggingInputSchema>;

const SmartFileTaggingOutputSchema = z.object({
  suggestedCategories: z.array(z.string()).describe('Suggested categories for the file.'),
});
export type SmartFileTaggingOutput = z.infer<typeof SmartFileTaggingOutputSchema>;

export async function smartFileTagging(input: SmartFileTaggingInput): Promise<SmartFileTaggingOutput> {
  return smartFileTaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartFileTaggingPrompt',
  input: {schema: SmartFileTaggingInputSchema},
  output: {schema: SmartFileTaggingOutputSchema},
  prompt: `You are an expert at categorizing files based on their content and context.

  Given the following file and context, suggest a few categories that would be appropriate for tagging the file.
  Return ONLY the string names of the categories.  Do not include any other text in your response.

  Context: {{{context}}}
  File: {{media url=fileDataUri}}
  Categories:`, // No closing curly braces here.  The LLM will generate the categories.
});

const smartFileTaggingFlow = ai.defineFlow(
  {
    name: 'smartFileTaggingFlow',
    inputSchema: SmartFileTaggingInputSchema,
    outputSchema: SmartFileTaggingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
