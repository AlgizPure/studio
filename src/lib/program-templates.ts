export const programTemplates = [
    {
        name: 'Foundation Strength',
        description: 'A 3-day per week program focused on building a solid strength base with compound lifts. Ideal for beginners or those returning to training.',
        workouts: [
            {
                name: 'Full Body A',
                description: 'Focus on core compound movements.',
                exercises: [
                    { exerciseId: 'squat', sets: 3, reps: 8 },
                    { exerciseId: 'bench_press', sets: 3, reps: 8 },
                    { exerciseId: 'barbell_row', sets: 3, reps: 8 },
                ]
            },
            {
                name: 'Full Body B',
                description: 'Alternate compound movements with accessory work.',
                 exercises: [
                    { exerciseId: 'deadlift', sets: 1, reps: 5 },
                    { exerciseId: 'overhead_press', sets: 3, reps: 8 },
                    { exerciseId: 'pull_ups', sets: 3, reps: 8 },
                ]
            }
        ]
    },
    {
        name: 'Cardio Boost',
        description: 'A plan to improve cardiovascular endurance and overall fitness through a mix of running, HIIT, and active recovery.',
        workouts: [
             {
                name: 'Interval Run',
                description: 'High-intensity interval running.',
                 exercises: [
                    { exerciseId: 'running', duration: '30min' },
                ]
            },
            {
                name: 'Bodyweight HIIT',
                description: 'A quick and effective high-intensity session.',
                 exercises: [
                    { exerciseId: 'push_ups', sets: 3, reps: 15 },
                    { exerciseId: 'burpees', sets: 3, reps: 15 },
                    { exerciseId: 'jumping_jacks', sets: 3, duration: '60s' },
                ]
            }
        ]
    },
    {
        name: 'Functional Fitness',
        description: 'Improve real-world strength and mobility with this program combining TRX, kettlebells, and bodyweight movements.',
        workouts: [
             {
                name: 'TRX & Kettlebell',
                description: 'Develop stability and power.',
                 exercises: [
                    { exerciseId: 'trx_row', sets: 3, reps: 12 },
                    { exerciseId: 'kettlebell_swing', sets: 3, reps: 15 },
                    { exerciseId: 'goblet_squat', sets: 3, reps: 10 },
                ]
            }
        ]
    }
] as const;
