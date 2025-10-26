'use client';
import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import type { HabitCategory, ExerciseCategory } from '@/lib/types';
import { useCollection } from '@/firebase';
import { CreditCard, LogOut, Settings, User, Timer, FolderKanban, Dumbbell } from 'lucide-react';
import { PomodoroSettingsDialog } from './pomodoro-settings-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { ManageExerciseCategoriesDialog } from './manage-exercise-categories-dialog';

export function UserNav() {
  const { user } = useUser();
  const firestore = useFirestore();

  const { data: habitCategories } = useCollection<HabitCategory>(user ? `users/${user.uid}/habitCategories` : null);
  const { data: exerciseCategories } = useCollection<ExerciseCategory>(user ? `users/${user.uid}/exerciseCategories` : null);

  const [isPomodoroSettingsOpen, setIsPomodoroSettingsOpen] = useState(false);
  const [isManageHabitCategoriesOpen, setIsManageHabitCategoriesOpen] = useState(false);
  const [isManageExerciseCategoriesOpen, setIsManageExerciseCategoriesOpen] = useState(false);

  const handleAddHabitCategory = async (name: string) => {
    if (!user || !firestore) return;
    await addDoc(collection(firestore, `users/${user.uid}/habitCategories`), { name });
  };
  const handleUpdateHabitCategory = async (category: HabitCategory) => {
    if (!user || !firestore || !category.id) return;
    await updateDoc(doc(firestore, `users/${user.uid}/habitCategories`, category.id), { name: category.name });
  };
  const handleDeleteHabitCategory = async (categoryId: string) => {
    if (!user || !firestore) return;
    await deleteDoc(doc(firestore, `users/${user.uid}/habitCategories`, categoryId));
  };
  
  const handleAddExerciseCategory = async (name: string) => {
    if (!user || !firestore) return;
    await addDoc(collection(firestore, `users/${user.uid}/exerciseCategories`), { name });
  };
  const handleUpdateExerciseCategory = async (category: ExerciseCategory) => {
    if (!user || !firestore || !category.id) return;
    await updateDoc(doc(firestore, `users/${user.uid}/exerciseCategories`, category.id), { name: category.name });
  };
  const handleDeleteExerciseCategory = async (categoryId: string) => {
     if (!user || !firestore) return;
    await deleteDoc(doc(firestore, `users/${user.uid}/exerciseCategories`, categoryId));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
              <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onSelect={() => setIsPomodoroSettingsOpen(true)}>
                    <Timer className="mr-2 h-4 w-4" />
                    <span>Pomodoro</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setIsManageHabitCategoriesOpen(true)}>
                    <FolderKanban className="mr-2 h-4 w-4" />
                    <span>Habit Categories</span>
                  </DropdownMenuItem>
                   <DropdownMenuItem onSelect={() => setIsManageExerciseCategoriesOpen(true)}>
                    <Dumbbell className="mr-2 h-4 w-4" />
                    <span>Exercise Categories</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <PomodoroSettingsDialog open={isPomodoroSettingsOpen} onOpenChange={setIsPomodoroSettingsOpen} />
      <ManageCategoriesDialog 
        open={isManageHabitCategoriesOpen} 
        onOpenChange={setIsManageHabitCategoriesOpen}
        categories={habitCategories || []}
        onAdd={handleAddHabitCategory}
        onUpdate={handleUpdateHabitCategory}
        onDelete={handleDeleteHabitCategory}
      />
      <ManageExerciseCategoriesDialog 
        open={isManageExerciseCategoriesOpen} 
        onOpenChange={setIsManageExerciseCategoriesOpen}
        categories={exerciseCategories || []}
        onAdd={handleAddExerciseCategory}
        onUpdate={handleUpdateExerciseCategory}
        onDelete={handleDeleteExerciseCategory}
      />
    </>
  );
}
