'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

/**
 * @fileoverview Диалоговое окно для импорта и применения рекомендаций из отчета Claude AI.
 */

/**
 * @typedef {object} Recommendation
 * @description Представляет одну рекомендацию, извлеченную из отчета Claude AI.
 * @property {'add' | 'modify' | 'pause'} action - Тип действия.
 * @property {string} [name] - Название привычки (для действия 'add').
 * @property {string} [habitId] - ID привычки (для 'modify', 'pause').
 * @property {any} [params] - Дополнительные параметры для действия.
 */
type Recommendation = {
  action: 'add' | 'modify' | 'pause';
  name?: string;
  habitId?: string;
  params?: any;
};

/**
 * Парсит Markdown-текст для извлечения структурированных рекомендаций.
 * @param {string} markdown - Входной Markdown-текст из отчета.
 * @returns {Recommendation[]} Массив объектов рекомендаций.
 */
function parseRecommendations(markdown: string): Recommendation[] {
  const lines = markdown.split(/\r?\n/);
  const recs: Recommendation[] = [];
  for (const l of lines) {
    const s = l.trim();
    // Примеры:
    // - add: habit "Drink Water" type=quantity target=2000 unit=ml
    // - modify: habitId=abc target=duration value=25 unit=min
    // - pause: habitId=xyz
    if (s.startsWith('- add:')) {
      const nameMatch = s.match(/"([^"]+)"/);
      const name = nameMatch?.[1];
      const targetMatch = s.match(/target=(\d+)/);
      const unitMatch = s.match(/unit=([a-zA-Z]+)/);
      const typeMatch = s.match(/type=(\w+)/);
      recs.push({ action: 'add', name, params: { type: typeMatch?.[1], target: targetMatch ? Number(targetMatch[1]) : undefined, unit: unitMatch?.[1] } });
    } else if (s.startsWith('- modify:')) {
      const idMatch = s.match(/habitId=([a-zA-Z0-9_-]+)/);
      const valMatch = s.match(/value=(\d+)/);
      const unitMatch = s.match(/unit=([a-zA-Z]+)/);
      const typeMatch = s.match(/target=(duration|quantity)/);
      if (idMatch) recs.push({ action: 'modify', habitId: idMatch[1], params: { targetType: typeMatch?.[1], value: valMatch ? Number(valMatch[1]) : undefined, unit: unitMatch?.[1] } });
    } else if (s.startsWith('- pause:')) {
      const idMatch = s.match(/habitId=([a-zA-Z0-9_-]+)/);
      if (idMatch) recs.push({ action: 'pause', habitId: idMatch[1] });
    }
  }
  return recs;
}

/**
 * Компонент диалогового окна для импорта рекомендаций из отчета Claude AI.
 * Пользователь может вставить текст отчета, который будет автоматически распарсен
 * для добавления, изменения или приостановки привычек.
 * @returns {JSX.Element} React-компонент.
 */
export function ImportClaudeDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [md, setMd] = useState('');
  const [busy, setBusy] = useState(false);

  /**
   * Обрабатывает применение извлеченных рекомендаций к данным пользователя в Firestore.
   */
  const handleApply = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const recs = parseRecommendations(md);
      const habitsCol = collection(firestore, `users/${user.uid}/habits`);
      for (const r of recs) {
        if (r.action === 'add' && r.name) {
          const payload: any = { name: r.name, categoryId: '', completed: false };
          if (r.params?.type) payload.type = r.params.type;
          if (r.params?.target) payload.target = { type: r.params?.type || 'quantity', value: r.params.target, unit: r.params?.unit };
          await addDoc(habitsCol, payload);
        } else if (r.action === 'modify' && r.habitId) {
          const ref = doc(firestore, `users/${user.uid}/habits/${r.habitId}`);
          const update: any = {};
          if (r.params?.targetType === 'duration' && typeof r.params.value === 'number') update.target = { type: 'duration', value: r.params.value, unit: r.params?.unit || 'min' };
          if (r.params?.targetType === 'quantity' && typeof r.params.value === 'number') update.target = { type: 'quantity', value: r.params.value, unit: r.params?.unit };
          await updateDoc(ref, update);
        } else if (r.action === 'pause' && r.habitId) {
          const ref = doc(firestore, `users/${user.uid}/habits/${r.habitId}`);
          await updateDoc(ref, { archived: true });
        }
      }
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Импорт из Claude</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Импорт рекомендаций</DialogTitle>
          <DialogDescription>Вставьте ключевые пункты из отчета Claude. Базовый парсер извлечет действия add/modify/pause.</DialogDescription>
        </DialogHeader>
        <Textarea rows={12} value={md} onChange={(e) => setMd(e.target.value)} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Отмена</Button>
          <Button type="button" onClick={handleApply} disabled={busy || !md.trim()}>{busy ? 'Применение...' : 'Применить'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
