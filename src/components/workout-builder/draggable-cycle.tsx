'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Cycle } from '@/lib/types';
import { CycleBuilder } from './cycle-builder';

/**
 * @fileoverview Компонент-обертка, делающий `CycleBuilder` перетаскиваемым.
 */

interface DraggableCycleProps {
  /** Объект цикла. */
  cycle: Cycle;
  /** Callback-функция при обновлении цикла. */
  onUpdate: (cycle: Cycle) => void;
  /** Callback-функция при удалении цикла. */
  onDelete: () => void;
}

/**
 * Компонент `DraggableCycle` является оберткой над `CycleBuilder`,
 * который использует `dnd-kit` для обеспечения функциональности перетаскивания (drag-and-drop).
 * @param {DraggableCycleProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function DraggableCycle({ cycle, onUpdate, onDelete }: DraggableCycleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cycle.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto', // Отображать перетаскиваемый элемент поверх других
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <CycleBuilder
        cycle={cycle}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={listeners} // Передаем listeners как ручку для перетаскивания
      />
    </div>
  );
}
