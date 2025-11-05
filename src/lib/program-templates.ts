/**
 * @fileoverview Содержит массив шаблонов программ тренировок.
 */

/**
 * Массив шаблонов программ тренировок.
 * @type {const Array<object>}
 */
export const programTemplates = [
    {
        name: 'Базовая сила',
        description: 'Программа 3 раза в неделю, направленная на создание прочной силовой базы с помощью базовых упражнений. Идеально подходит для новичков или тех, кто возвращается к тренировкам.',
        workouts: [
            {
                name: 'Все тело А',
                description: 'Сосредоточьтесь на основных базовых движениях.',
                exercises: [
                    { exerciseId: 'squat', sets: 3, reps: 8 },
                    { exerciseId: 'bench_press', sets: 3, reps: 8 },
                    { exerciseId: 'barbell_row', sets: 3, reps: 8 },
                ]
            },
            {
                name: 'Все тело Б',
                description: 'Чередуйте базовые движения со вспомогательной работой.',
                 exercises: [
                    { exerciseId: 'deadlift', sets: 1, reps: 5 },
                    { exerciseId: 'overhead_press', sets: 3, reps: 8 },
                    { exerciseId: 'pull_ups', sets: 3, reps: 8 },
                ]
            }
        ]
    },
    {
        name: 'Кардио-ускорение',
        description: 'План по улучшению сердечно-сосудистой выносливости и общей физической формы за счет сочетания бега, ВИИТ и активного восстановления.',
        workouts: [
             {
                name: 'Интервальный бег',
                description: 'Интервальный бег высокой интенсивности.',
                 exercises: [
                    { exerciseId: 'running', duration: '30min' },
                ]
            },
            {
                name: 'ВИИТ с собственным весом',
                description: 'Быстрая и эффективная высокоинтенсивная тренировка.',
                 exercises: [
                    { exerciseId: 'push_ups', sets: 3, reps: 15 },
                    { exerciseId: 'burpees', sets: 3, reps: 15 },
                    { exerciseId: 'jumping_jacks', sets: 3, duration: '60s' },
                ]
            }
        ]
    },
    {
        name: 'Функциональный фитнес',
        description: 'Улучшите реальную силу и мобильность с помощью этой программы, сочетающей TRX, гири и движения с собственным весом.',
        workouts: [
             {
                name: 'TRX и гири',
                description: 'Развивайте стабильность и мощность.',
                 exercises: [
                    { exerciseId: 'trx_row', sets: 3, reps: 12 },
                    { exerciseId: 'kettlebell_swing', sets: 3, reps: 15 },
                    { exerciseId: 'goblet_squat', sets: 3, reps: 10 },
                ]
            }
        ]
    }
] as const;
