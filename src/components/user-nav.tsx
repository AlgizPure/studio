'use client';
import { useState } from 'react';
import { useAuth, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from '@/firebase/auth';
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
import { CreditCard, LogOut, Settings, User, Timer, FolderKanban, Dumbbell, LogIn } from 'lucide-react';
import { PomodoroSettingsDialog } from './pomodoro-settings-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const habitCategoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories } = useCollection<HabitCategory>(habitCategoriesQuery);

  const exerciseCategoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exerciseCategories`) : null),
    [user, firestore]
  );
  const { data: exerciseCategories } = useCollection<ExerciseCategory>(exerciseCategoriesQuery);

  const [isPomodoroSettingsOpen, setIsPomodoroSettingsOpen] = useState(false);
  const [isManageHabitCategoriesOpen, setIsManageHabitCategoriesOpen] = useState(false);
  const [isManageExerciseCategoriesOpen, setIsManageExerciseCategoriesOpen] = useState(false);

  const handleAddHabitCategory = (name: string) => {
    if (!user || !firestore) return;
    const catCollection = collection(firestore, `users/${user.uid}/habitCategories`);
    addDoc(catCollection, { name }).catch(err => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'create',
        path: catCollection.path,
        requestResourceData: { name },
      }));
    });
  };
  const handleUpdateHabitCategory = (category: HabitCategory) => {
    if (!user || !firestore || !category.id) return;
    const catDoc = doc(firestore, `users/${user.uid}/habitCategories`, category.id);
    updateDoc(catDoc, { name: category.name }).catch(err => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'update',
        path: catDoc.path,
        requestResourceData: { name: category.name },
      }));
    });
  };
  const handleDeleteHabitCategory = (categoryId: string) => {
    if (!user || !firestore) return;
    const catDoc = doc(firestore, `users/${user.uid}/habitCategories`, categoryId);
    deleteDoc(catDoc).catch(err => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'delete',
        path: catDoc.path,
      }));
    });
  };
  
  const handleAddExerciseCategory = (name: string) => {
    if (!user || !firestore) return;
    const catCollection = collection(firestore, `users/${user.uid}/exerciseCategories`);
    addDoc(catCollection, { name }).catch(err => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'create',
        path: catCollection.path,
        requestResourceData: { name },
      }));
    });
  };
  const handleUpdateExerciseCategory = (category: ExerciseCategory) => {
    if (!user || !firestore || !category.id) return;
    const catDoc = doc(firestore, `users/${user.uid}/exerciseCategories`, category.id);
    updateDoc(catDoc, { name: category.name }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'update',
        path: catDoc.path,
        requestResourceData: { name: category.name },
      }));
    });
  };
  const handleDeleteExerciseCategory = (categoryId: string) => {
     if (!user || !firestore) return;
    const catDoc = doc(firestore, `users/${user.uid}/exerciseCategories`, categoryId);
    deleteDoc(catDoc).catch(err => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        operation: 'delete',
        path: catDoc.path,
      }));
    });
  };

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
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4"/>
          Login
        </Link>
      </Button>
    )
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
              <p className="text-sm font-medium leading-none">{user?.displayName || 'Zenith User'}</p>
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
          <DropdownMenuItem onClick={handleSignOut}>
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
        categoryType="Habit"
      />
      <ManageCategoriesDialog 
        open={isManageExerciseCategoriesOpen} 
        onOpenChange={setIsManageExerciseCategoriesOpen}
        categories={exerciseCategories || []}
        onAdd={handleAddExerciseCategory}
        onUpdate={handleUpdateExerciseCategory}
        onDelete={handleDeleteExerciseCategory}
        categoryType="Exercise"
      />
    </>
  );
}
