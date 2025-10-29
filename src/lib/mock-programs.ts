import type { Program, ProgramStats } from './types';

export const mockPrograms: Program[] = [
  {
    id: 'prog_1',
    name: 'Весенний набор массы',
    description: '8-недельная программа для набора мышечной массы',
    startDate: '2025-03-01',
    endDate: '2025-04-26',
    durationType: 'fixed',
    status: 'draft',
    goal: 'mass_gain',
    tags: ['#силовая', '#масса', '#8недель'],
    workouts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user_1',
  },
];

export const mockProgramStats: Record<string, ProgramStats> = {
  prog_1: {
    programId: 'prog_1',
    totalPlanned: 0,
    totalCompleted: 0,
    totalSkipped: 0,
    completionRate: 0,
    totalVolume: 0,
    totalDuration: 0,
    lastUpdated: new Date().toISOString(),
  },
};
