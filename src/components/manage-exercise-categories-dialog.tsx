
'use client';

import React, { useState, useEffect } from 'react';
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
import { exerciseCategories as initialCategories } from '@/lib/data';
import type { ExerciseCategory } from '@/lib/types';
import { X, Plus, Pencil, Check } from 'lucide-react';

interface ManageExerciseCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setCategories?: React.Dispatch<React.SetStateAction<ExerciseCategory[]>>;
}

export function ManageExerciseCategoriesDialog({ open, onOpenChange, setCategories: setExternalCategories }: ManageExerciseCategoriesDialogProps) {
  const [categories, setCategories] = useState<ExerciseCategory[]>(initialCategories);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    if (setExternalCategories) {
      setExternalCategories(categories);
    }
  }, [categories, setExternalCategories]);

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: ExerciseCategory = {
        id: `excat${Date.now()}`,
        name: newCategoryName.trim(),
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      toast({ title: 'Category Added', description: `${newCategory.name} has been added.` });
    }
  };
  
  const handleEdit = (category: ExerciseCategory) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };
  
  const handleSaveEdit = (categoryId: string) => {
    if(editingCategoryName.trim()) {
      setCategories(categories.map(c => c.id === categoryId ? { ...c, name: editingCategoryName.trim() } : c));
      setEditingCategoryId(null);
      toast({ title: 'Category Updated', description: `Category has been updated to ${editingCategoryName.trim()}.` });
    }
  };

  const handleDelete = (categoryId: string) => {
    const categoryName = categories.find(c => c.id === categoryId)?.name;
    setCategories(categories.filter(c => c.id !== categoryId));
    toast({ variant: 'destructive', title: 'Category Deleted', description: `${categoryName} has been deleted.` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Exercise Categories</DialogTitle>
          <DialogDescription>
            Add, edit, or delete your exercise categories.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Categories</Label>
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
                <Label htmlFor="new-category">Add New Category</Label>
                <div className="flex gap-2">
                    <Input id="new-category" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., Strength, Cardio" />
                    <Button onClick={handleAddNewCategory}>
                        <Plus className="mr-2 h-4 w-4"/> Add
                    </Button>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
