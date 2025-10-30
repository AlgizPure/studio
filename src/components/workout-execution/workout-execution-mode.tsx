'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, CheckCircle2, X } from 'lucide-react';
import type { WorkoutExtended, WorkoutLog, CycleLog, ExerciseLog, SetLog, WorkoutExecutionStatus } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { SetTracker } from './set-tracker';
import { RestTimer } from './rest-timer';
import { WorkoutFeedbackDialog } from '@/components/workout-feedback-dialog';

interface WorkoutExecutionModeProps {
  workout: WorkoutExtended;
  programId?: string;
  onComplete: (log: Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  onCancel: () => void;
}

export function WorkoutExecutionMode({
  workout,
  programId,
  onComplete,
  onCancel,
}: WorkoutExecutionModeProps) {
  const [status, setStatus] = useState<WorkoutExecutionStatus>('not_started');
  const [startTime, setStartTime] = useState<string | null>(null);
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const [currentCycleRepetition, setCurrentCycleRepetition] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  
  const [cycleLogs, setCycleLogs] = useState<CycleLog[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0); // seconds

  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(0);

  // Timer
  useEffect(() => {
    if (status === 'in_progress' && !isResting) {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, isResting]);

  const handleStart = () => {
    setStatus('in_progress');
    setStartTime(new Date().toISOString());
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    setStatus('in_progress');
  };

  const handleCompleteWorkout = () => {
    const endTime = new Date().toISOString();
    const duration = Math.floor(elapsedTime / 60);

    const log: Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
      workoutId: workout.id,
      programId,
      date: new Date().toISOString().split('T')[0],
      startTime: startTime!,
      endTime,
      duration,
      status: 'completed',
      cycles: cycleLogs,
      totalVolume: calculateTotalVolume(),
    };
    // Show feedback dialog; on submit attach and forward
    setPendingLog(log);
    setShowFeedback(true);
  };

  const calculateTotalVolume = () => {
    let total = 0;
    cycleLogs.forEach((cycleLog) => {
      cycleLog.exercises.forEach((exLog) => {
        exLog.sets.forEach((set) => {
          if (set.completed && set.weight) {
            total += set.weight * set.reps;
          }
        });
      });
    });
    return total;
  };
  
  const currentCycleDef = workout.cycles?.[currentCycleIndex];
  const currentExerciseDef = currentCycleDef?.exercises[currentExerciseIndex];

  const handleSetComplete = (setLog: Omit<SetLog, 'timestamp'>) => {
    const newLog = {...setLog, timestamp: new Date().toISOString()};

    setCycleLogs(prevLogs => {
      const updatedLogs = JSON.parse(JSON.stringify(prevLogs));
    
      let cycleLog = updatedLogs.find(
        (log: CycleLog) => log.cycleId === currentCycleDef!.id && 
               log.cycleNumber === currentCycleRepetition
      );
      
      if (!cycleLog) {
        cycleLog = {
          cycleId: currentCycleDef!.id,
          cycleNumber: currentCycleRepetition,
          exercises: [],
          completed: false,
        };
        updatedLogs.push(cycleLog);
      }
      
      let exerciseLog = cycleLog.exercises.find(
        (ex: ExerciseLog) => ex.exerciseId === currentExerciseDef!.exerciseId
      );
      
      if (!exerciseLog) {
        exerciseLog = {
          exerciseId: currentExerciseDef!.exerciseId,
          sets: [],
          skipped: false,
        };
        cycleLog.exercises.push(exerciseLog);
      }
      
      exerciseLog.sets.push(newLog);
      
      return updatedLogs;
    });

    if (currentSetIndex < (currentExerciseDef?.targetReps?.split('-').length || 1) - 1) {
      setCurrentSetIndex(prev => prev + 1);
      if(currentExerciseDef?.restAfter) {
          setRestDuration(currentExerciseDef.restAfter);
          setIsResting(true);
      }
    } else {
      moveToNextExercise();
    }
  };
  
  const moveToNextExercise = () => {
      if (currentExerciseIndex < (currentCycleDef?.exercises.length || 0) - 1) {
          setCurrentExerciseIndex(prev => prev + 1);
          setCurrentSetIndex(0);
      } else {
          if (currentCycleRepetition < (currentCycleDef?.repetitions || 1) - 1) {
              setCurrentCycleRepetition(prev => prev + 1);
              setCurrentExerciseIndex(0);
              setCurrentSetIndex(0);
          } else {
              if (currentCycleIndex < (workout.cycles?.length || 0) - 1) {
                  setCurrentCycleIndex(prev => prev + 1);
                  setCurrentCycleRepetition(0);
                  setCurrentExerciseIndex(0);
                  setCurrentSetIndex(0);
              } else {
                  handleCompleteWorkout();
              }
          }
      }
      
      if(currentCycleDef?.restAfter) {
        setRestDuration(currentCycleDef.restAfter);
        setIsResting(true);
      }
  }
  
  const handleRestComplete = () => {
      setIsResting(false);
  }

  const calculateProgress = useMemo(() => {
    if(!workout.cycles || workout.cycles.length === 0) return 0;
    
    let totalExercises = 0;
    workout.cycles.forEach(c => totalExercises += c.exercises.length * c.repetitions);
    
    if (totalExercises === 0) return 0;

    let completedExercises = 0;
    for(let i=0; i<currentCycleIndex; i++) {
        completedExercises += workout.cycles[i].exercises.length * workout.cycles[i].repetitions;
    }
    completedExercises += currentCycleRepetition * (workout.cycles[currentCycleIndex]?.exercises.length || 0);
    completedExercises += currentExerciseIndex;

    return (completedExercises / totalExercises) * 100;
  }, [workout.cycles, currentCycleIndex, currentCycleRepetition, currentExerciseIndex]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [showFeedback, setShowFeedback] = useState(false);
  const [pendingLog, setPendingLog] = useState<Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt' | 'userId'> | null>(null);

  const handleFeedbackSubmit = (feedback: string, tags: string[]) => {
    if (!pendingLog) return;
    onComplete({ ...pendingLog, userFeedback: feedback || undefined, feedbackTags: tags && tags.length ? tags : undefined } as any);
    setPendingLog(null);
    setShowFeedback(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{workout.name}</CardTitle>
              <p className="text-muted-foreground mt-1 line-clamp-1">
                {workout.description || 'No description'}
              </p>
            </div>
            <Badge variant={status === 'in_progress' ? 'default' : 'secondary'}>
              {status === 'not_started' && 'Ready'}
              {status === 'in_progress' && 'Active'}
              {status === 'paused' && 'Paused'}
              {status === 'completed' && 'Completed'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold font-mono">{formatTime(elapsedTime)}</div>
            {currentCycleDef && <div className="text-sm text-muted-foreground">
              Cycle {currentCycleIndex + 1}/{workout.cycles?.length} • Rep {currentCycleRepetition + 1}/
              {currentCycleDef.repetitions || 1}
            </div>}
          </div>
          <Progress value={calculateProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Main Content */}
      {isResting ? (
          <RestTimer duration={restDuration} onComplete={handleRestComplete} onSkip={handleRestComplete} />
      ) : status !== 'not_started' && currentCycleDef && currentExerciseDef ? (
         <SetTracker 
            key={`${currentCycleIndex}-${currentExerciseIndex}-${currentSetIndex}`}
            setNumber={currentSetIndex + 1}
            targetReps={currentExerciseDef.targetReps || '10'}
            targetWeight={currentExerciseDef.targetWeight}
            onComplete={handleSetComplete}
            onSkip={moveToNextExercise}
         />
      ) : null}


      {/* Controls */}
      <div className="flex gap-2">
        {status === 'not_started' && (
          <Button onClick={handleStart} className="flex-1" size="lg">
            <Play className="mr-2 h-5 w-5" />
            Start Workout
          </Button>
        )}

        {status === 'in_progress' && (
          <>
            <Button onClick={handlePause} variant="outline" className="flex-1">
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
            <Button onClick={handleCompleteWorkout} className="flex-1">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete
            </Button>
          </>
        )}

        {status === 'paused' && (
          <>
            <Button onClick={handleResume} className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
            <Button onClick={handleCompleteWorkout} variant="outline" className="flex-1">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finish Early
            </Button>
          </>
        )}

        <Button onClick={onCancel} variant="ghost" size="icon">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <WorkoutFeedbackDialog
        open={showFeedback}
        onOpenChange={setShowFeedback}
        onSubmit={handleFeedbackSubmit}
        workoutName={workout.name}
      />
    </div>
  );
}
