'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { AnalysisSystem } from '@/lib/types';

const daysOfWeek: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  goal: z.string().optional(),
  days: z.array(z.string()).optional(),
  usePomodoro: z.boolean().default(false).optional(),
  // V2 fields (optional, backward compatible)
  type: z.enum(['boolean', 'quantity', 'duration']).default('boolean').optional(),
  targetValue: z.number().min(0).optional(),
  targetUnit: z.string().optional(),
  reminderTimes: z.array(z.string()).default([]).optional(),
  stackingEnabled: z.boolean().default(false).optional(),
  stackingTriggerId: z.string().optional(),
  stackingPosition: z.enum(['before', 'after']).optional(),
  stackingDelay: z.number().min(0).optional(),
  // tags/priority/difficulty
  tags: z.array(z.string()).default([]).optional(),
  priority: z.number().min(1).max(5).optional(),
  difficulty: z.enum(['easy','medium','hard']).optional(),
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface AddHabitDialogProps {
  onHabitAdd: (habit: Omit<Habit, 'id'>) => void;
  onHabitUpdate?: (habit: Habit) => void;
  onHabitDelete?: (habitId: string) => void;
  habitToEdit?: Habit;
  trigger?: React.ReactNode;
  openManageCategories: () => void;
  categories: HabitCategory[];
  habits?: Habit[];
}

export function AddHabitDialog({ onHabitAdd, onHabitUpdate, onHabitDelete, habitToEdit, trigger, openManageCategories, categories, habits = [] }: AddHabitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!habitToEdit;
  const { user } = useUser();
  const firestore = useFirestore();
  const activeQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/activeSystems`) : null),
    [user, firestore]
  );
  const { data: activeSystems } = useCollection<any>(activeQuery);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && habitToEdit) {
        setValue('name', habitToEdit.name);
        setValue('categoryId', habitToEdit.categoryId || '');
        setValue('goal', habitToEdit.goal);
        setValue('days', habitToEdit.days || []);
        setValue('usePomodoro', !!habitToEdit.pomodoro);
      } else {
          reset({
              name: '',
              categoryId: '',
              goal: '',
              days: [],
              usePomodoro: false,
              type: 'boolean',
              targetValue: undefined,
              targetUnit: undefined,
              reminderTimes: [],
              stackingEnabled: false,
              stackingTriggerId: undefined,
              stackingPosition: undefined,
              stackingDelay: undefined,
              tags: [],
              priority: 3,
              difficulty: 'medium',
          });
      }
    }
  }, [isEditMode, habitToEdit, setValue, reset, isOpen]);


  const watchedDays = watch('days') || [];

  const handleAllDaysChange = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setValue('days', daysOfWeek, { shouldValidate: true });
    } else {
      setValue('days', [], { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<HabitFormValues> = (data) => {
    try {
      // collect system params to contextParams
      const contextParams: Record<string, Record<string, any>> = {};
      (activeSystems || []).forEach((sys) => {
        const sysParams: Record<string, any> = {};
        Object.keys((data as any) || {}).forEach((k) => {
          const prefix = `sys_${sys.systemId}_`;
          if (k.startsWith(prefix)) {
            const pid = k.substring(prefix.length);
            (sysParams as any)[pid] = (data as any)[k];
          }
        });
        if (Object.keys(sysParams).length > 0) {
          contextParams[sys.systemId] = sysParams;
        }
      });
      if(isEditMode && habitToEdit && onHabitUpdate) {
          const updatedHabit: Habit = {
              ...habitToEdit,
              name: data.name,
              categoryId: data.categoryId,
              goal: data.goal,
              days: data.days as Day[],
              pomodoro: data.usePomodoro ? (habitToEdit.pomodoro || { cycles: 1 }) : undefined,
          };
          // Attach V2 fields in a backward-compatible way
          const updatedWithV2 = {
            ...updatedHabit,
            ...(data.type && { type: data.type }),
            ...(data.type === 'quantity' && data.targetValue != null && {
              target: { type: 'quantity', value: data.targetValue, unit: data.targetUnit || undefined },
            }),
            ...(data.type === 'duration' && data.targetValue != null && {
              target: { type: 'duration', value: data.targetValue, unit: data.targetUnit || 'min' },
            }),
            ...(data.reminderTimes && data.reminderTimes.length > 0 && {
              reminders: [{ id: 'default', times: data.reminderTimes }],
            }),
            ...((data.stackingEnabled && data.stackingTriggerId && data.stackingPosition) && {
              stackingRule: {
                triggerId: data.stackingTriggerId,
                position: data.stackingPosition,
                ...(typeof data.stackingDelay === 'number' ? { delay: data.stackingDelay } : {}),
              },
            }),
            ...(Object.keys(contextParams).length > 0 && { contextParams }),
            ...(data.tags && data.tags.length > 0 && { tags: data.tags }),
            ...(typeof data.priority === 'number' && { priority: data.priority }),
            ...(data.difficulty && { difficulty: data.difficulty }),
          } as any;
          onHabitUpdate(updatedWithV2 as Habit);
          toast({
              title: 'Habit Updated',
              description: `${data.name} has been updated.`,
          });
      } else {
          const newHabit: Omit<Habit, 'id'> = {
            name: data.name,
            categoryId: data.categoryId,
            goal: data.goal,
            completed: false,
            days: data.days as Day[],
            ...(data.usePomodoro && { pomodoro: { cycles: 1 } }),
          };
          const newWithV2 = {
            ...newHabit,
            ...(data.type && { type: data.type }),
            ...(data.type === 'quantity' && data.targetValue != null && {
              target: { type: 'quantity', value: data.targetValue, unit: data.targetUnit || undefined },
            }),
            ...(data.type === 'duration' && data.targetValue != null && {
              target: { type: 'duration', value: data.targetValue, unit: data.targetUnit || 'min' },
            }),
            ...(data.reminderTimes && data.reminderTimes.length > 0 && {
              reminders: [{ id: 'default', times: data.reminderTimes }],
            }),
            ...((data.stackingEnabled && data.stackingTriggerId && data.stackingPosition) && {
              stackingRule: {
                triggerId: data.stackingTriggerId,
                position: data.stackingPosition,
                ...(typeof data.stackingDelay === 'number' ? { delay: data.stackingDelay } : {}),
              },
            }),
            ...(Object.keys(contextParams).length > 0 && { contextParams }),
            ...(data.tags && data.tags.length > 0 && { tags: data.tags }),
            ...(typeof data.priority === 'number' && { priority: data.priority }),
            ...(data.difficulty && { difficulty: data.difficulty }),
          } as any;
          onHabitAdd(newWithV2 as Omit<Habit, 'id'>);
          toast({
            title: 'Habit Added',
            description: `${data.name} has been added to your list.`,
          });
      }
      setIsOpen(false);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was an error saving the habit.'
      });
    }
  };

  const handleDelete = () => {
    if(isEditMode && habitToEdit && onHabitDelete) {
      try {
        onHabitDelete(habitToEdit.id);
        toast({
            title: 'Habit Deleted',
            description: `${habitToEdit.name} has been removed.`,
            variant: 'destructive',
        });
        setIsOpen(false);
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'There was an error deleting the habit.'
        });
      }
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'add-new') {
        setIsOpen(false);
        openManageCategories();
    } else {
        setValue('categoryId', value, { shouldValidate: true });
    }
  }

  const dialogTrigger = trigger ? trigger : (
    <Button variant="ghost" size="sm">
      <Plus className="mr-2 h-4 w-4" />
      New
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {dialogTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Habit' : 'Add Custom Habit'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details for your habit.' : "Add a new habit to your personal list. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" placeholder="e.g., Drink Water" className="col-span-3" {...register('name')} />
            </div>
            {errors.name && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.name.message}</p>}
            
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryId" className="text-right">
                    Category
                </Label>
                <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={handleCategoryChange} value={field.value}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Habit Categories</SelectLabel>
                                    <SelectItem value="add-new">
                                        <span className="flex items-center"><Plus className="mr-2 h-4 w-4" /> Add new category...</span>
                                    </SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
            {errors.categoryId && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.categoryId.message}</p>}


            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                Goal
              </Label>
              <Input id="goal" placeholder="e.g., 8 glasses" className="col-span-3" {...register('goal')} />
            </div>
            {errors.goal && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.goal.message}</p>}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(v) => field.onChange(v)} value={field.value || 'boolean'}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Habit Type</SelectLabel>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Target fields for quantity/duration */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => {
              const t = field.value || 'boolean';
              if (t === 'quantity' || t === 'duration') {
                return (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="targetValue" className="text-right">
                      {t === 'quantity' ? 'Target value' : 'Minutes'}
                    </Label>
                    <div className="col-span-3 grid grid-cols-3 gap-2">
                      <Input type="number" step="1" id="targetValue" placeholder={t === 'quantity' ? 'e.g., 2000' : 'e.g., 20'} {...register('targetValue', { valueAsNumber: true })} />
                      <div className="col-span-2">
                        <Input id="targetUnit" placeholder={t === 'quantity' ? 'e.g., ml, km, steps' : 'min'} {...register('targetUnit')} />
                      </div>
                    </div>
                  </div>
                );
              }
              return <div className="hidden" />;
            }}
          />

          {/* Reminders */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Reminders</Label>
            <div className="col-span-3 space-y-2">
              <Controller
                name="reminderTimes"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {(field.value || []).map((t: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={t}
                          placeholder="HH:MM"
                          onChange={(e) => {
                            const next = [...(field.value || [])];
                            next[idx] = e.target.value;
                            field.onChange(next);
                          }}
                        />
                        <Button type="button" variant="ghost" onClick={() => {
                          const next = [...(field.value || [])];
                          next.splice(idx, 1);
                          field.onChange(next);
                        }}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={() => field.onChange([...(field.value || []), '08:00'])}>+ Add time</Button>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Stacking */}
          {/* Tags / Priority / Difficulty */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Tags</Label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <div className="col-span-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(field.value || []).map((t: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 px-2 py-1 rounded bg-muted text-xs">
                        <span>#{t}</span>
                        <Button type="button" size="sm" variant="ghost" onClick={() => {
                          const next = [...(field.value || [])];
                          next.splice(idx,1);
                          field.onChange(next);
                        }}>x</Button>
                      </div>
                    ))}
                  </div>
                  <Input placeholder="add tag and press Enter" onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (!val) return;
                      field.onChange([...(field.value || []), val]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }} />
                </div>
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Priority</Label>
            <Input className="col-span-3" type="number" step="1" min={1} max={5} {...register('priority', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Difficulty</Label>
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(v)=>field.onChange(v)} value={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Stacking</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <Controller
                  name="stackingEnabled"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="stackingEnabled" checked={!!field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="stackingEnabled" className="text-sm font-normal">Enable habit stacking</Label>
              </div>
              <Controller
                name="stackingTriggerId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(v)} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger habit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Habits</SelectLabel>
                        {habits.map(h => (
                          <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <Controller
                name="stackingPosition"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(v)} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Before or After" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="before">Before</SelectItem>
                        <SelectItem value="after">After</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stackingDelay" className="text-right">Delay (min)</Label>
                <Input id="stackingDelay" className="col-span-3" type="number" step="1" placeholder="e.g., 5" {...register('stackingDelay', { valueAsNumber: true })} />
              </div>
            </div>
          </div>

          {/* Active systems parameters */}
          {(activeSystems || []).length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Analysis systems</div>
              {(activeSystems || []).map((sys) => (
                <div key={sys.systemId} className="space-y-2 p-2 rounded border">
                  <div className="text-sm font-medium">{sys.systemId}</div>
                  {(sys.parameters || sys.habitParameters || []).map((p: any) => (
                    <div key={p.id} className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">{p.label || p.id}</Label>
                      <div className="col-span-3">
                        {p.type === 'select' ? (
                          <Controller
                            name={`sys_${sys.systemId}_${p.id}` as any}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={(v) => field.onChange(v)} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {(p.options || []).map((opt: any) => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label || opt.value}</SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        ) : p.type === 'number' || p.type === 'slider' ? (
                          <Input type="number" step="1" {...register(`sys_${sys.systemId}_${p.id}` as any, { valueAsNumber: true })} />
                        ) : p.type === 'checkbox' ? (
                          <Controller
                            name={`sys_${sys.systemId}_${p.id}` as any}
                            control={control}
                            render={({ field }) => (
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            )}
                          />
                        ) : (
                          <Input {...register(`sys_${sys.systemId}_${p.id}` as any)} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Days
              </Label>
              <Controller
                name="days"
                control={control}
                render={({ field }) => (
                  <div className="col-span-3 grid grid-cols-4 items-center gap-y-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center gap-2">
                        <Checkbox
                          id={`day-habit-${day}-${habitToEdit?.id || 'new'}`}
                          checked={field.value?.includes(day)}
                          onCheckedChange={(checked) => {
                            const currentDays = field.value || [];
                            if (checked) {
                              field.onChange([...currentDays, day]);
                            } else {
                              field.onChange(currentDays.filter(d => d !== day));
                            }
                          }}
                        />
                        <Label htmlFor={`day-habit-${day}-${habitToEdit?.id || 'new'}`} className="text-sm font-normal">{day.substring(0,3)}</Label>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`all-days-habit-${habitToEdit?.id || 'new'}`}
                        checked={watchedDays.length === daysOfWeek.length}
                        onCheckedChange={handleAllDaysChange}
                      />
                      <Label htmlFor={`all-days-habit-${habitToEdit?.id || 'new'}`} className="text-sm font-normal">All</Label>
                    </div>
                  </div>
                )}
              />
            </div>
             {errors.days && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.days.message}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="usePomodoro" className="text-right">Pomodoro</Label>
                <Controller
                    name="usePomodoro"
                    control={control}
                    render={({ field }) => (
                        <div className="col-span-3 flex items-center gap-2">
                            <Checkbox
                                id={`usePomodoro-${habitToEdit?.id || 'new'}`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <Label htmlFor={`usePomodoro-${habitToEdit?.id || 'new'}`} className="text-sm font-normal">Enable Pomodoro Timer</Label>
                        </div>
                    )}
                />
            </div>
          </div>
          <DialogFooter>
            {isEditMode && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your habit.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Save Habit'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
