'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Cycle } from '@/lib/types';
import { CycleBuilder } from './cycle-builder';

interface DraggableCycleProps {
  cycle: Cycle;
  onUpdate: (cycle: Cycle) => void;
  onDelete: () => void;
}

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
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <CycleBuilder
        cycle={cycle}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={listeners}
      />
    </div>
  );
}
