'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BUILTIN_SYSTEMS } from '@/lib/systems';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useUserCollection } from '@/hooks/use-user-collection';
import type { ActiveSystem } from '@/lib/types';

export function SystemLibraryDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);

  const { data: activeSystems } = useUserCollection<ActiveSystem>('activeSystems');

  const isActive = (systemId: string) => !!(activeSystems || []).find(s => s.systemId === systemId);

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
        <Button variant="secondary" size="sm">Systems</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Analysis Systems</DialogTitle>
          <DialogDescription>Activate systems to add context and analytics.</DialogDescription>
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
                    {isActive(sys.id) ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


