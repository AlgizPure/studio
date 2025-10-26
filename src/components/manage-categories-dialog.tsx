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
import type { HabitCategory } from '@/lib/types';
import { X, Plus, Pencil, Check } from 'lucide-react';

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: HabitCategory[];
  onAdd: (name: string) => Promise<void>;
  onUpdate: (category: HabitCategory) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ManageCategoriesDialog({ open, onOpenChange, categories, onAdd, onUpdate, onDelete }: ManageCategoriesDialogProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const { toast } = useToast();

  const handleAddNewCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await onAdd(newCategoryName.trim());
        setNewCategoryName('');
        toast({ title: 'Category Added', description: `${newCategoryName.trim()} has been added.` });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: `Failed to add category.` });
      }
    }
  };
  
  const handleEdit = (category: HabitCategory) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };
  
  const handleSaveEdit = async (categoryId: string) => {
    if(editingCategoryName.trim()) {
      try {
        await onUpdate({ id: categoryId, name: editingCategoryName.trim() });
        setEditingCategoryId(null);
        toast({ title: 'Category Updated', description: `Category has been updated to ${editingCategoryName.trim()}.` });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: `Failed to update category.` });
      }
    }
  };

  const handleDelete = async (categoryId: string) => {
    const categoryName = categories.find(c => c.id === categoryId)?.name;
    try {
      await onDelete(categoryId);
      toast({ variant: 'destructive', title: 'Category Deleted', description: `${categoryName} has been deleted.` });
    } catch(e) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to delete category.` });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Habit Categories</DialogTitle>
          <DialogDescription>
            Add, edit, or delete your habit categories.
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
                    <Input id="new-category" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., Health, Work, Personal" />
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
