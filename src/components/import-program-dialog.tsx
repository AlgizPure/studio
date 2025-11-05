'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { parseZTLOrPatch, toYAML, toJSON } from '@/lib/ztl/parser';

/**
 * @fileoverview Диалоговое окно для импорта программ или патчей в формате ZTL.
 */

/**
 * Свойства для компонента ImportProgramDialog.
 * @interface ImportProgramDialogProps
 * @property {boolean} open - Определяет, открыто ли диалоговое окно.
 * @property {(v: boolean) => void} onOpenChange - Функция обратного вызова при изменении состояния открытости.
 * @property {(data: any) => Promise<void> | void} onImport - Функция обратного вызова при импорте данных.
 */
interface ImportProgramDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: (data: any) => Promise<void> | void;
}

/**
 * Компонент диалогового окна для импорта программ.
 * @param {ImportProgramDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} - Диалоговое окно для импорта программ.
 */
export function ImportProgramDialog({
  open,
  onOpenChange,
  onImport,
}: ImportProgramDialogProps) {
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewAs, setPreviewAs] = useState<'yaml' | 'json'>('yaml');

  const handleParse = () => {
    setError(null);
    try {
      const res = parseZTLOrPatch(raw);
      setParsed(res);
    } catch (e: any) {
      setParsed(null);
      setError(e?.message || 'Ошибка разбора');
    }
  };

  const handleImport = async () => {
    if (!parsed) return;
    await onImport(parsed.value);
    setRaw('');
    setParsed(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Импорт программы или патча (ZTL)</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea rows={10} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Вставьте YAML или JSON сюда" />
          <div className="flex gap-2">
            <Button onClick={handleParse}>Проверить</Button>
            <Button variant="secondary" onClick={() => setPreviewAs(previewAs === 'yaml' ? 'json' : 'yaml')}>
              Предпросмотр как {previewAs === 'yaml' ? 'JSON' : 'YAML'}
            </Button>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          {parsed && (
            <div className="rounded-md border p-3 bg-muted text-sm whitespace-pre-wrap overflow-auto max-h-64">
              {parsed.kind.toUpperCase()} ПРЕДПРОСМОТР\n\n
              {previewAs === 'yaml' ? toYAML(parsed.value) : toJSON(parsed.value)}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button disabled={!parsed} onClick={handleImport}>Импортировать и активировать</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
