'use client';
import { useState } from 'react';

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
import { userProfile } from '@/lib/data';
import { CreditCard, LogOut, Settings, User, Timer, FolderKanban, Dumbbell } from 'lucide-react';
import { PomodoroSettingsDialog } from './pomodoro-settings-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { ManageExerciseCategoriesDialog } from './manage-exercise-categories-dialog';

export function UserNav() {
  const [isPomodoroSettingsOpen, setIsPomodoroSettingsOpen] = useState(false);
  const [isManageHabitCategoriesOpen, setIsManageHabitCategoriesOpen] = useState(false);
  const [isManageExerciseCategoriesOpen, setIsManageExerciseCategoriesOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
              <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userProfile.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userProfile.email}
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
      <ManageCategoriesDialog open={isManageHabitCategoriesOpen} onOpenChange={setIsManageHabitCategoriesOpen} />
      <ManageExerciseCategoriesDialog open={isManageExerciseCategoriesOpen} onOpenChange={setIsManageExerciseCategoriesOpen} />
    </>
  );
}
