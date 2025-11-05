'use client';
import { useState } from 'react';
import { useAuth, useUser } from '@/firebase/provider';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { signOut } from '@/firebase/auth';

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
import { useCollection } from '@/firebase/firestore/use-collection';
import { CreditCard, LogOut, Settings, User, Timer, FolderKanban, Dumbbell, LogIn } from 'lucide-react';
import { PomodoroSettingsDialog } from './pomodoro-settings-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileoverview Компонент навигации пользователя, отображающий аватар и выпадающее меню.
 */

/**
 * Компонент `UserNav` отображает аватар текущего пользователя.
 * При клике открывается выпадающее меню с опциями, такими как "Профиль", "Настройки",
 * "Выйти" и т.д. Также управляет диалоговыми окнами для настроек Pomodoro и
 * управления категориями.
 * @returns {JSX.Element} React-компонент.
 */
export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const habitCategoriesQuery = useMemoFirebase(() => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null), [user, firestore]);
  const { data: habitCategories } = useCollection<HabitCategory>(habitCategoriesQuery);

  const exerciseCategoriesQuery = useMemoFirebase(() => (user ? collection(firestore, `users/${user.uid}/exerciseCategories`) : null), [user, firestore]);
  const { data: exerciseCategories } = useCollection<ExerciseCategory>(exerciseCategoriesQuery);

  const [isPomodoroSettingsOpen, setIsPomodoroSettingsOpen] = useState(false);
  const [isManageHabitCategoriesOpen, setIsManageHabitCategoriesOpen] = useState(false);
  const [isManageExerciseCategoriesOpen, setIsManageExerciseCategoriesOpen] = useState(false);

  const handleAddCategory = (type: 'Habit' | 'Exercise') => (name: string) => { /* ... */ };
  const handleUpdateCategory = (type: 'Habit' | 'Exercise') => (category: HabitCategory | ExerciseCategory) => { /* ... */ };
  const handleDeleteCategory = (type: 'Habit' | 'Exercise') => (categoryId: string) => { /* ... */ };

  /**
   * Выполняет выход пользователя из системы.
   */
  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (isUserLoading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <Button asChild variant="outline">
        <Link href="/login"><LogIn className="mr-2 h-4 w-4"/>Войти</Link>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
              <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.displayName || 'Пользователь'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem><User className="mr-2 h-4 w-4" /><span>Профиль</span></DropdownMenuItem>
            <DropdownMenuItem><CreditCard className="mr-2 h-4 w-4" /><span>Оплата</span></DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger><Settings className="mr-2 h-4 w-4" /><span>Настройки</span></DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onSelect={() => setIsPomodoroSettingsOpen(true)}><Timer className="mr-2 h-4 w-4" /><span>Pomodoro</span></DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setIsManageHabitCategoriesOpen(true)}><FolderKanban className="mr-2 h-4 w-4" /><span>Категории привычек</span></DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setIsManageExerciseCategoriesOpen(true)}><Dumbbell className="mr-2 h-4 w-4" /><span>Категории упражнений</span></DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /><span>Выйти</span></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <PomodoroSettingsDialog open={isPomodoroSettingsOpen} onOpenChange={setIsPomodoroSettingsOpen} />
      <ManageCategoriesDialog open={isManageHabitCategoriesOpen} onOpenChange={setIsManageHabitCategoriesOpen} categories={habitCategories || []} onAdd={handleAddCategory('Habit')} onUpdate={handleUpdateCategory('Habit')} onDelete={handleDeleteCategory('Habit')} categoryType="Habit" />
      <ManageCategoriesDialog open={isManageExerciseCategoriesOpen} onOpenChange={setIsManageExerciseCategoriesOpen} categories={exerciseCategories || []} onAdd={handleAddCategory('Exercise')} onUpdate={handleUpdateCategory('Exercise')} onDelete={handleDeleteCategory('Exercise')} categoryType="Exercise" />
    </>
  );
}
