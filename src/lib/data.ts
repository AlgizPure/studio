import type { Exercise, Workout, Habit, DailySchedule, UserProfile, Day, HabitCategory } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { Dumbbell, HeartPulse, BrainCircuit, BookOpen, Wind, CheckCircle } from 'lucide-react';

const findImage = (hint: string) => PlaceHolderImages.find(img => img.imageHint.includes(hint))?.imageUrl || 'https://picsum.photos/seed/default/600/400';

export const userProfile: UserProfile = {
  name: 'Alex',
  email: 'alex.sum@example.com',
  avatarUrl: findImage('profile'),
};

export const exercises: Exercise[] = [
  { id: 'ex1', name: 'Barbell Squats', category: 'Strength', description: 'Squat with a barbell on your shoulders.', image: findImage('barbell squat') },
  { id: 'ex2', name: 'Overhead Press', category: 'Strength', description: 'Lift a barbell or dumbbells overhead.', image: findImage('strength2') },
  { id: 'ex3', name: 'Bench Press', category: 'Strength', description: 'Lie on a bench and press a weight upwards.', image: findImage('bench press') },
  { id: 'ex4', name: 'Tricep Dips', category: 'Strength', description: 'Lower and raise your body with your arms.', image: findImage('bodyweight') },
  { id: 'ex5', name: 'Deadlifts', category: 'Strength', description: 'Lift a barbell off the floor to hip level.', image: findImage('deadlift') },
  { id: 'ex6', name: 'Bicep Curls', category: 'Strength', description: 'Curl dumbbells towards your shoulders.', image: findImage('strength1') },
  { id: 'ex7', name: 'Crunches', category: 'Strength', description: 'Flex your abdominal muscles.', image: findImage('bodyweight') },
  { id: 'ex8', name: 'Neck Bridges', category: 'Strength', description: 'Strengthen your neck muscles.', image: findImage('static') },
  { id: 'ex9', name: 'Grip Squeezes', category: 'Strength', description: 'Improve your grip strength.', image: findImage('strength3') },
  { id: 'ex10', name: 'Trail Running', category: 'Cardio', description: 'Run on uneven, natural terrain.', image: findImage('trail running') },
  { id: 'ex11', name: 'Functional Patterns', category: 'Bio-dynamics', description: 'Exercises mimicking natural human movements.', image: findImage('dynamic yoga') },
  { id: 'ex12', name: 'Joint Mobilization', category: 'Bio-dynamics', description: 'Improve joint range of motion.', image: findImage('dynamic yoga') },
  { id: 'ex13', name: 'TRX Rows', category: 'TRX', description: 'Use TRX straps to perform a rowing motion.', image: findImage('TRX training') },
  { id: 'ex14', name: 'Plank', category: 'Static', description: 'Hold a push-up like position.', image: findImage('plank') },
];

export const workouts: Workout[] = [
  {
    id: 'w1',
    name: 'Legs & Shoulders',
    exercises: [{ exerciseId: 'ex1', sets: 4, reps: 8 }, { exerciseId: 'ex2', sets: 3, reps: 10 }, { exerciseId: 'ex7' }, { exerciseId: 'ex8' }, { exerciseId: 'ex9' }]
  },
  {
    id: 'w2',
    name: 'Chest & Triceps',
    exercises: [{ exerciseId: 'ex3', sets: 4, reps: 8 }, { exerciseId: 'ex4', sets: 3, reps: 12 }, { exerciseId: 'ex7' }, { exerciseId: 'ex8' }, { exerciseId: 'ex9' }]
  },
  {
    id: 'w3',
    name: 'Back & Biceps',
    exercises: [{ exerciseId: 'ex5', sets: 3, reps: 6 }, { exerciseId: 'ex6', sets: 3, reps: 12 }, { exerciseId: 'ex7' }, { exerciseId: 'ex8' }, { exerciseId: 'ex9' }]
  },
  {
    id: 'w4',
    name: 'Bio-dynamics & Mobility',
    exercises: [{ exerciseId: 'ex11', duration: '30min' }, { exerciseId: 'ex12', duration: '15min' }]
  },
  {
    id: 'w5',
    name: 'Static Strength (Zass)',
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

const scheduleTemplate: { [key in Day]: DailySchedule } = {
  Monday: {
    day: 'Monday',
    items: [
      { id: 's1', time: '06:00', activityType: 'Run', activityName: 'Trail Running', duration: '45min', icon: HeartPulse },
      { id: 's2', time: '10:00', activityType: 'Workout', activityName: 'Legs & Shoulders', duration: '75min', icon: Dumbbell }
    ],
  },
  Tuesday: {
    day: 'Tuesday',
    items: [
      { id: 's3', time: '06:00', activityType: 'Run', activityName: 'Trail Running', duration: '45min', icon: HeartPulse },
      { id: 's4', time: '10:00', activityType: 'Workout', activityName: 'Bio-dynamics & Mobility', duration: '60min', icon: Wind }
    ],
  },
  Wednesday: {
    day: 'Wednesday',
    items: [
      { id: 's5', time: '06:00', activityType: 'Run', activityName: 'Trail Running', duration: '45min', icon: HeartPulse },
      { id: 's6', time: '10:00', activityType: 'Workout', activityName: 'Chest & Triceps', duration: '75min', icon: Dumbbell },
      { id: 's7', time: '20:00', activityType: 'Workout', activityName: 'Static Strength (Zass)', duration: '20min', icon: CheckCircle }
    ],
  },
  Thursday: {
    day: 'Thursday',
    items: [
      { id: 's8', time: '06:00', activityType: 'Run', activityName: 'Trail Running', duration: '45min', icon: HeartPulse },
      { id: 's9', time: '10:00', activityType: 'Workout', activityName: 'Bio-dynamics & Mobility', duration: '60min', icon: Wind }
    ],
  },
  Friday: {
    day: 'Friday',
    items: [
      { id: 's10', time: '06:00', activityType: 'Run', activityName: 'Trail Running', duration: '45min', icon: HeartPulse },
      { id: 's11', time: '10:00', activityType: 'Workout', activityName: 'Back & Biceps', duration: '75min', icon: Dumbbell },
      { id: 's12', time: '20:00', activityType: 'Workout', activityName: 'Static Strength (Zass)', duration: '20min', icon: CheckCircle }
    ],
  },
  Saturday: {
    day: 'Saturday',
    items: [
      { id: 's13', time: '08:00', activityType: 'Workout', activityName: 'Bio-dynamics & Mobility', duration: '60min', icon: Wind },
      { id: 's14', time: '14:00', activityType: 'Workout', activityName: 'Static Strength (Zass)', duration: '20min', icon: CheckCircle }
    ],
  },
  Sunday: {
    day: 'Sunday',
    items: [],
  },
};

export const weeklySchedule: DailySchedule[] = Object.values(scheduleTemplate);
