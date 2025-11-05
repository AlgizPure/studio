'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { HabitCategory, ExerciseCategory } from '@/lib/types';
import { X, Plus, Pencil, Check } from 'lucide-react';

/**
 * @fileoverview Диалоговое окно для управления категориями (привычек или упражнений).
 */

type Category = HabitCategory | ExerciseCategory;

/**
 * @interface ManageCategoriesDialogProps
 * @description Свойства для компонента ManageCategoriesDialog.
 */
interface ManageCategoriesDialogProps {
  /** Определяет, открыто ли диалоговое окно. */
  open: boolean;
  /** Callback-функция при изменении состояния открытости. */
  onOpenChange: (open: boolean) => void;
  /** Массив категорий для отображения и управления. */
  categories: Category[];
  /** Callback-функция при добавлении новой категории. */
  onAdd: (name: string) => void;
  /** Callback-функция при обновлении существующей категории. */
  onUpdate: (category: Category) => void;
  /** Callback-функция при удалении категории. */
  onDelete: (id: string) => void;
  /** Тип управляемых категорий. */
  categoryType: 'Habit' | 'Exercise';
}

/**
 * Компонент диалогового окна для управления категориями.
 * Позволяет пользователям добавлять, редактировать и удалять категории привычек или упражнений.
 * @param {ManageCategoriesDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function ManageCategoriesDialog({ open, onOpenChange, categories, onAdd, onUpdate, onDelete, categoryType }: ManageCategoriesDialogProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const { toast } = useToast();

  /**
   * Обрабатывает добавление новой категории.
   */
  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      try {
        onAdd(newCategoryName.trim());
        setNewCategoryName('');
        toast({ title: 'Категория добавлена', description: `Категория "${newCategoryName.trim()}" была добавлена.` });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Ошибка', description: `Не удалось добавить категорию.` });
      }
    }
  };
  
  /**
   * Включает режим редактирования для выбранной категории.
   * @param {Category} category - Категория для редактирования.
   */
  const handleEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };
  
  /**
   * Сохраняет изменения в названии категории.
   * @param {string} categoryId - ID редактируемой категории.
   */
  const handleSaveEdit = (categoryId: string) => {
    if(editingCategoryName.trim()) {
      try {
        onUpdate({ id: categoryId, name: editingCategoryName.trim() });
        setEditingCategoryId(null);
        toast({ title: 'Категория обновлена', description: `Название категории изменено на "${editingCategoryName.trim()}".` });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Ошибка', description: `Не удалось обновить категорию.` });
      }
    }
  };

  /**
   * Обрабатывает удаление категории.
   * @param {string} categoryId - ID удаляемой категории.
   */
  const handleDelete = (categoryId: string) => {
    const categoryName = categories.find(c => c.id === categoryId)?.name;
    try {
      onDelete(categoryId);
      toast({ variant: 'destructive', title: 'Категория удалена', description: `Категория "${categoryName}" была удалена.` });
    } catch(e) {
      toast({ variant: 'destructive', title: 'Ошибка', description: `Не удалось удалить категорию.` });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Управление категориями ({categoryType === 'Habit' ? 'Привычки' : 'Упражнения'})</DialogTitle>
          <DialogDescription>
            Добавляйте, редактируйте или удаляйте ваши категории.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Категории</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {categories.map((category) => (
                        <div key={category.id} className="flex items-center gap-2 p-2 rounded-md border">
                            {editingCategoryId === category.id ? (
                                <Input value={editingCategoryName} onChange={e => setEditingCategoryName(e.target.value)} className="h-8"/>
                            ) : (
                                <span className="flex-1">{category.name}</span>
                            )}
                            {editingCategoryId === category.id ? (
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSaveEdit(category.id)}>
                                    <Check className="h-4 w-4"/>
                                </Button>
                            ) : (
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(category)}>
                                    <Pencil className="h-4 w-4"/>
                                </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(category.id)}>
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-category">Добавить новую категорию</Label>
                <div className="flex gap-2">
                    <Input id="new-category" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder={`например, ${categoryType === 'Habit' ? 'Здоровье, Работа' : 'Силовые, Кардио'}`} />
                    <Button onClick={handleAddNewCategory}>
                        <Plus className="mr-2 h-4 w-4"/> Добавить
                    </Button>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Готово</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
