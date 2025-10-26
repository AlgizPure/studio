'use client';
import { useState } from 'react';
import { exercises as initialExercises } from '@/lib/data';
import { ExerciseCard } from '@/components/exercise-card';
import { Input } from '@/components/ui/input';
import { AddExerciseDialog } from '@/components/add-exercise-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Exercise } from '@/lib/types';

const categories = ['All', 'Strength', 'Cardio', 'Bio-dynamics', 'TRX', 'Bodyweight', 'Static'];

export default function LibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddExercise = (newExercise: Exercise) => {
    setExercises(prev => [...prev, newExercise]);
  };
  
  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Exercise Library
          </h1>
          <p className="text-muted-foreground">
            Browse, create, and manage your exercises.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Search exercises..." 
            className="w-full md:w-64" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddExerciseDialog onExerciseAdd={handleAddExercise} />
        </div>
      </div>
      <Tabs defaultValue="All" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
              {filteredExercises
                .filter(ex => category === 'All' || ex.category === category)
                .map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
            </div>
            {filteredExercises.filter(ex => category === 'All' || ex.category === category).length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No exercises found in this category.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
