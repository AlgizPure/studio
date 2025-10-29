'use client';

import { Calendar, Play, Pause, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Program } from '@/lib/types';

interface ProgramCardProps {
  program: Program;
  onEdit?: (programId: string) => void;
  onDelete?: (programId: string) => void;
  onActivate?: (programId: string) => void;
  onPause?: (programId: string) => void;
}

export function ProgramCard({ 
  program, 
  onEdit, 
  onDelete, 
  onActivate, 
  onPause 
}: ProgramCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: Program['status']) => {
    const colors = {
      draft: 'bg-gray-500',
      active: 'bg-green-500',
      paused: 'bg-yellow-500',
      completed: 'bg-blue-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: Program['status']) => {
    const labels = {
      draft: 'Draft',
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed',
    };
    return labels[status] || status;
  };

  return (
    <Card className="glass hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="font-headline text-xl">{program.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {program.description || 'No description'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(program.id)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {program.status === 'draft' && (
                <DropdownMenuItem onClick={() => onActivate?.(program.id)}>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
              {program.status === 'active' && (
                <DropdownMenuItem onClick={() => onPause?.(program.id)}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </DropdownMenuItem>
              )}
              {program.status === 'paused' && (
                <DropdownMenuItem onClick={() => onActivate?.(program.id)}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete?.(program.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(program.startDate)} - {formatDate(program.endDate)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(program.status)}>
            {getStatusLabel(program.status)}
          </Badge>
          {program.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex justify-between w-full text-sm text-muted-foreground">
          <span>{program.workouts.length} workouts</span>
          <span>{program.durationType === 'infinite' ? '∞' : 'Fixed duration'}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
