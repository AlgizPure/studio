'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Program } from '@/lib/types';
import { Badge } from './ui/badge';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

/**
 * @fileoverview Компонент карточки для отображения информации о программе тренировок.
 */

/**
 * @interface ProgramCardProps
 * @description Свойства для компонента ProgramCard.
 */
interface ProgramCardProps {
  /** Объект программы для отображения. */
  program: Program;
  /** Callback-функция, вызываемая при добавлении программы-шаблона к программам пользователя. */
  onAddTemplate: (program: Program) => void;
}

/**
 * Компонент-карточка, отображающий основную информацию о программе тренировок.
 * Позволяет либо перейти к деталям программы, либо добавить ее как шаблон,
 * в зависимости от свойства `isTemplate`.
 * @param {ProgramCardProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function ProgramCard({ program, onAddTemplate }: ProgramCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  /**
   * Обрабатывает клик по кнопке "Добавить".
   */
  const handleAddClick = async () => {
    setIsAdding(true);
    await onAddTemplate(program);
    setIsAdding(false);
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{program.name}</CardTitle>
            {program.isTemplate && <Badge variant="secondary">Шаблон</Badge>}
        </div>
        <CardDescription className="h-10 text-ellipsis overflow-hidden">{program.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground">
            <p>3 тренировки в неделю</p>
            <p>6 недель</p>
        </div>
      </CardContent>
      <CardFooter>
        {program.isTemplate ? (
            <Button className="w-full" onClick={handleAddClick} disabled={isAdding}>
                <Plus className="mr-2 h-4 w-4" />
                {isAdding ? 'Добавление...' : 'Добавить в мои программы'}
            </Button>
        ) : (
            <Button variant="outline" className="w-full" asChild>
                <Link href={`/programs/${program.id}`}>Просмотр программы</Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
