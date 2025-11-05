'use client';

import React, { useState, useEffect, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Play } from 'lucide-react';
import { mockPrograms } from '@/lib/mock-programs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddWorkoutToProgramDialog } from '@/components/add-workout-to-program-dialog';
import { ProgressionSuggestionsPanel } from '@/components/programs/progression-suggestions-panel';
import type { WorkoutExtended, ProgramWorkout, Program, WorkoutLog } from '@/lib/types';
import Link from 'next/link';
import { WorkoutExecutionMode } from '@/components/workout-execution/workout-execution-mode';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { addDoc, collection, doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileoverview Страница с подробной информацией о программе тренировок.
 * Отображает детали программы, список тренировок и предложения по прогрессии от AI.
 */

/**
 * Компонент страницы с подробной информацией о программе.
 * @param {object} props - Свойства компонента.
 * @param {Promise<{ programId: string }>} props.params - Параметры маршрута, содержащие ID программы.
 * @returns {JSX.Element} - Страница с подробной информацией о программе.
 */
export default function ProgramDetailPage({ 
  params 
}: { 
  params: Promise<{ programId: string }>;
}) {
  const { programId } = use(params);
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  // Загрузка программы из Firestore
  const programDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, `users/${user.uid}/programs/${programId}`) : null),
    [user, firestore, programId]
  );
  const { data: programFromFirestore, isLoading: isLoadingProgram } = useDoc<Program>(programDocRef);

  // Резервные данные из моков, если Firestore не имеет данных
  const [program, setProgram] = useState<Program | undefined>(
    programFromFirestore || mockPrograms.find(p => p.id === programId)
  );

  // Обновление программы при загрузке данных из Firestore
  useEffect(() => {
    if (programFromFirestore) {
      setProgram(programFromFirestore);
    }
  }, [programFromFirestore]);

  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [executingWorkout, setExecutingWorkout] = useState<WorkoutExtended | null>(null);

  // Отображение состояния загрузки при получении данных из Firestore
  if (isLoadingProgram && !program) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Загрузка программы...</p>
        </div>
      </div>
    );
  }

  /**
   * Обрабатывает завершение тренировки.
   * @param {Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt' | 'userId'>} log - Лог завершенной тренировки.
   */
  const handleWorkoutComplete = async (log: Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user || !firestore) {
      toast({
        title: 'Ошибка',
        description: 'Пользователь не аутентифицирован. Не удается сохранить лог.',
        variant: 'destructive',
      });
      return;
    }
  
    try {
      const workoutLogsRef = collection(firestore, `users/${user.uid}/workoutLogs`);
      await addDoc(workoutLogsRef, {
        ...log,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
  
      toast({
        title: 'Тренировка завершена!',
        description: 'Ваша тренировка была успешно записана.',
      });
  
      setExecutingWorkout(null);
    } catch (error) {
      console.error("Не удалось сохранить лог тренировки:", error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить лог тренировки. Пожалуйста, попробуйте еще раз.',
        variant: 'destructive',
      });
    }
  };
  

  if (!program) {
    notFound();
  }

  /**
   * Форматирует строку с датой.
   * @param {string} [dateString] - Строка с датой.
   * @returns {string} - Отформатированная дата.
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  /**
   * Добавляет тренировку в программу.
   * @param {WorkoutExtended} workout - Добавляемая тренировка.
   * @param {ProgramWorkout['schedule']} schedule - Расписание тренировки.
   */
  const handleWorkoutAdd = (workout: WorkoutExtended, schedule: ProgramWorkout['schedule']) => {
    const programWorkout: ProgramWorkout = {
      workoutId: workout.id,
      schedule,
      completed: 0,
      skipped: 0,
    };
    
    if (!(program as any).detailedWorkouts) {
      (program as any).detailedWorkouts = [];
    }
    (program as any).detailedWorkouts.push(workout);


    setProgram({
      ...program,
      workouts: [...program.workouts, programWorkout],
    });
  };
  
  /**
   * Начинает выполнение тренировки.
   * @param {WorkoutExtended} workout - Тренировка для начала.
   */
  const handleStartWorkout = (workout: WorkoutExtended) => {
    setExecutingWorkout(workout);
  };

  return (
    <>
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.push('/programs')}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
            <Badge>{program.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {formatDate(program.startDate)} - {program.durationType === 'fixed' ? formatDate(program.endDate) : 'Постоянная'}
          </p>
        </div>
      </div>

      {/* Описание */}
      {program.description && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Описание</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{program.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Теги и цель */}
      <div className="grid md:grid-cols-2 gap-4">
        {program.tags.length > 0 && (
          <Card className="glass flex-1">
            <CardHeader>
              <CardTitle>Теги</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {program.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {program.goal && (
          <Card className="glass flex-1">
            <CardHeader>
              <CardTitle>Цель</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{program.goal}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Предложения по прогрессии от AI */}
      {program.status === 'active' && program.workouts.length > 0 && user && (
        <ProgressionSuggestionsPanel program={program} />
      )}

      {/* Секция тренировок */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Тренировки</CardTitle>
              <CardDescription>
                Тренировочные сессии в этой программе
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddWorkoutOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить тренировку
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {program.workouts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>Тренировки еще не добавлены</p>
              <p className="text-sm mt-2">Нажмите "Добавить тренировку", чтобы начать</p>
            </div>
          ) : (
            <div className="space-y-4">
              {program.workouts.map((pw, index) => {
                const workoutDetail = (program as any).detailedWorkouts?.find((w: WorkoutExtended) => w.id === pw.workoutId);
                return (
                    <Card key={index}>
                      <CardHeader>
                          <CardTitle>{workoutDetail?.name || `Тренировка ${index + 1}`}</CardTitle>
                          <CardDescription>
                          {pw.schedule.intervalType === 'days_of_week' 
                              ? `${(pw.schedule.intervalValue as string[]).join(', ')}`
                              : `Каждые ${pw.schedule.intervalValue} дней`
                          }
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {workoutDetail && (
                          <Button onClick={() => handleStartWorkout(workoutDetail)}>
                            <Play className="mr-2 h-4 w-4" />
                            Начать тренировку
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления тренировки */}
      <AddWorkoutToProgramDialog
        open={isAddWorkoutOpen}
        onOpenChange={setIsAddWorkoutOpen}
        onWorkoutAdd={handleWorkoutAdd}
      />
    </div>

    {executingWorkout && (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4 md:p-8">
        <WorkoutExecutionMode
          workout={executingWorkout}
          programId={program.id}
          onComplete={handleWorkoutComplete}
          onCancel={() => setExecutingWorkout(null)}
        />
      </div>
    )}
    </>
  );
}
