import type { Exercise, Workout, Habit, DailySchedule, UserProfile, Day, HabitCategory, ExerciseCategory } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { Dumbbell, HeartPulse, BrainCircuit, BookOpen, Wind, CheckCircle } from 'lucide-react';

const findImage = (hint: string) => PlaceHolderImages.find(img => img.imageHint.includes(hint))?.imageUrl || 'https://picsum.photos/seed/default/600/400';

export const userProfile: UserProfile = {
  name: 'Alex',
  email: 'alex.sum@example.com',
  avatarUrl: findImage('profile'),
};

export const exerciseCategories: ExerciseCategory[] = [
    { id: 'excat1', name: 'Strength' },
    { id: 'excat2', name: 'Cardio' },
    { id: 'excat3', name: 'Bio-dynamics' },
    { id: 'excat4', name: 'TRX' },
    { id: 'excat5', name: 'Bodyweight' },
    { id: 'excat6', name: 'Static' },
];

export const exercises: Exercise[] = [
  { id: 'ex1', name: 'Barbell Squats', categoryId: 'excat1', description: 'Squat with a barbell on your shoulders.', image: findImage('barbell squat') },
  { id: 'ex2', name: 'Overhead Press', categoryId: 'excat1', description: 'Lift a barbell or dumbbells overhead.', image: findImage('strength2') },
  { id: 'ex3', name: 'Bench Press', categoryId: 'excat1', description: 'Lie on a bench and press a weight upwards.', image: findImage('bench press') },
  { id: 'ex4', name: 'Tricep Dips', categoryId: 'excat1', description: 'Lower and raise your body with your arms.', image: findImage('bodyweight') },
  { id: 'ex5', name: 'Deadlifts', categoryId: 'excat1', description: 'Lift a barbell off the floor to hip level.', image: findImage('deadlift') },
  { id: 'ex6', name: 'Bicep Curls', categoryId: 'excat1', description: 'Curl dumbbells towards your shoulders.', image: findImage('strength1') },
  { id: 'ex7', name: 'Crunches', categoryId: 'excat1', description: 'Flex your abdominal muscles.', image: findImage('bodyweight') },
  { id: 'ex8', name: 'Neck Bridges', categoryId: 'excat1', description: 'Strengthen your neck muscles.', image: findImage('static') },
  { id: 'ex9', name: 'Grip Squeezes', categoryId: 'excat1', description: 'Improve your grip strength.', image: findImage('strength3') },
  { id: 'ex10', name: 'Trail Running', categoryId: 'excat2', description: 'Run on uneven, natural terrain.', image: findImage('trail running') },
  { id: 'ex11', name: 'Functional Patterns', categoryId: 'excat3', description: 'Exercises mimicking natural human movements.', image: findImage('dynamic yoga') },
  { id: 'ex12', name: 'Joint Mobilization', categoryId: 'excat3', description: 'Improve joint range of motion.', image: findImage('dynamic yoga') },
  { id: 'ex13', name: 'TRX Rows', categoryId: 'excat4', description: 'Use TRX straps to perform a rowing motion.', image: findImage('TRX training') },
  { id: 'ex14', name: 'Plank', categoryId: 'excat6', description: 'Hold a push-up like position.', image: findImage('plank') },
];

export const workouts: Workout[] = [
  {
    id: 'w1',
    name: 'Legs & Shoulders',
    description: 'A workout focusing on lower body and shoulder strength.',
    exercises: [{ exerciseId: 'ex1', sets: 4, reps: 8 }, { exerciseId: 'ex2', sets: 3, reps: 10 }, { exerciseId: 'ex7' }, { exerciseId: 'ex8' }, { exerciseId: 'ex9' }]
  },
  {
    id: 'w2',
    name: 'Chest & Triceps',
    description: 'A workout for upper body pushing muscles.',
    exercises: [{ exerciseId: 'ex3', sets: 4, reps: 8 }, { exerciseId: 'ex4', sets: 3, reps: 12 }, { exerciseId: 'ex7' }, { exerciseId: 'ex8' }, { exerciseId: 'ex9' }]
  },
  {
    id: 'w3',
    name: 'Back & Biceps',
    description: 'A workout for upper body pulling muscles.',
    exercises: [{ exerciseId: 'ex5', sets: 3, reps: 6 }, { exerciseId: 'ex6', sets: 3, reps: 12 }, { exerciseId: 'ex7' }, { exerciseId: 'ex8' }, { exerciseId: 'ex9' }]
  },
  {
    id: 'w4',
    name: 'Bio-dynamics & Mobility',
    description: 'Improve your movement quality and joint health.',
    exercises: [{ exerciseId: 'ex11', duration: '30min' }, { exerciseId: 'ex12', duration: '15min' }]
  },
  {
    id: 'w5',
    name: 'Static Strength (Zass)',
    description: 'Isometric holds for building tendon and muscle strength.',
    exercises: [{ exerciseId: 'ex14', duration: '5min cycle' }]
  }
];

export const habitCategories: HabitCategory[] = [
    { id: 'cat1', name: 'Mindfulness' },
    { id: 'cat2', name: 'Learning' },
    { id: 'cat3', name: 'Fitness' },
];

export const habits: Habit[] = [
    { id: 'h1', name: 'Meditation', categoryId: 'cat1', goal: '15 minutes', completed: true, pomodoro: { cycles: 1 } },
    { id: 'h2', name: 'Study Lessons', categoryId: 'cat2', goal: '2 lessons', completed: false, pomodoro: { cycles: 2 } },
    { id: 'h3', name: 'Morning Run', categoryId: 'cat3', goal: '8 km', completed: true },
];

export const weeklySchedule: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
