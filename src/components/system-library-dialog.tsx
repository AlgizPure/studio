'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BUILTIN_SYSTEMS } from '@/lib/systems';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';

/**
 * @fileoverview Диалоговое окно для управления библиотекой систем анализа.
 * Позволяет пользователям активировать и деактивировать различные системы.
 */

/**
 * Компонент диалогового окна библиотеки систем.
 * @returns {JSX.Element} - Диалоговое окно библиотеки систем.
 */
export function SystemLibraryDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);

  const activeQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/activeSystems`) : null),
    [user, firestore]
  );
  const { data: activeSystems } = useCollection<any>(activeQuery);

  /**
   * Проверяет, активна ли система.
   * @param {string} systemId - ID системы.
   * @returns {boolean} - true, если система активна, иначе false.
   */
  const isActive = (systemId: string) => !!(activeSystems || []).find(s => s.systemId === systemId);

  /**
   * Переключает состояние активации системы.
   * @param {string} systemId - ID системы.
   */
  const handleToggle = async (systemId: string) => {
    if (!user || !firestore) return;
    const ref = doc(firestore, `users/${user.uid}/activeSystems/${systemId}`);
    if (isActive(systemId)) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        systemId,
        activatedAt: new Date().toISOString(),
        isPremium: false,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Системы</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Системы анализа</DialogTitle>
          <DialogDescription>Активируйте системы для добавления контекста и аналитики.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUILTIN_SYSTEMS.map(sys => (
            <Card key={sys.id} className="border">
              <CardHeader>
                <CardTitle className="text-base">{sys.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{sys.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">v{sys.version}</span>
                  <Button size="sm" variant={isActive(sys.id) ? 'outline' : 'default'} onClick={() => handleToggle(sys.id)}>
                    {isActive(sys.id) ? 'Деактивировать' : 'Активировать'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
