'use server';
/**
 * @fileOverview An AI-powered routine optimizer flow.
 *
 * - aiRoutineOptimizer - A function that handles the routine optimization process.
 * - AIRoutineOptimizerInput - The input type for the aiRoutineOptimizer function.
 * - AIRoutineOptimizerOutput - The return type for the aiRoutineOptimizer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIRoutineOptimizerInputSchema = z.object({
  goals: z
    .string()
    .describe(
      'The users fitness goals, e.g., speed, muscle definition, fat loss.'
    ),
  availability: z
    .string()
    .describe(
      'The users schedule availability, including days and times available for workouts.'
    ),
  preferredExercises: z
    .string()
    .describe(
      'The users preferred exercise types, e.g., strength training, bio-dynamics, running, static exercises.'
    ),
  customExercises: z
    .string()
    .optional()
    .describe(
      'A list of custom exercises provided by the user, including name and description.'
    ),
});
export type AIRoutineOptimizerInput = z.infer<typeof AIRoutineOptimizerInputSchema>;

const ScheduledActivitySchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).describe("The time for the activity in HH:mm format."),
  activityName: z.string().describe("The name of the exercise or habit."),
  activityType: z.enum(['Workout', 'Habit']).describe("The type of activity."),
});

const AIRoutineOptimizerOutputSchema = z.object({
  textualDescription: z
    .string()
    .describe(
      'A user-friendly, textual description of the suggested weekly exercise schedule.'
    ),
  structuredSchedule: z.array(ScheduledActivitySchema).describe("A structured array of all suggested activities for the week."),
});
export type AIRoutineOptimizerOutput = z.infer<typeof AIRoutineOptimizerOutputSchema>;
export type ScheduledActivity = z.infer<typeof ScheduledActivitySchema>;

export async function aiRoutineOptimizer(input: AIRoutineOptimizerInput): Promise<AIRoutineOptimizerOutput> {
  return aiRoutineOptimizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiRoutineOptimizerPrompt',
  input: {schema: AIRoutineOptimizerInputSchema},
  output: {schema: AIRoutineOptimizerOutputSchema},
  prompt: `You are an AI fitness assistant that generates an exercise schedule based on preferences, schedule, and goals.

  Generate a well-structured weekly exercise schedule, taking into consideration the user's specified fitness goals, schedule availability, preferred exercise types, and any custom exercises provided.

  Your response MUST include both a conversational, user-friendly textual description of the schedule AND a structured JSON array of every single activity.
  
  For the structuredSchedule:
  - Each item must have a day, a specific time in HH:mm format, an activityName, and an activityType ('Workout' or 'Habit').
  - Base the 'activityName' on the user's preferred and custom exercises. If an exercise sounds like a workout, classify it as 'Workout'. If it sounds like a daily routine (e.g., 'Morning Run', 'Meditation'), classify it as 'Habit'.

  User Preferences:
  - Fitness Goals: {{{goals}}}
  - Schedule Availability: {{{availability}}}
  - Preferred Exercises: {{{preferredExercises}}}
  - Custom Exercises: {{{customExercises}}}
  `,
});

const aiRoutineOptimizerFlow = ai.defineFlow(
  {
    name: 'aiRoutineOptimizerFlow',
    inputSchema: AIRoutineOptimizerInputSchema,
    outputSchema: AIRoutineOptimizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
