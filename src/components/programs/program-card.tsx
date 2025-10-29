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
import Link from 'next/link';

type ProgramCardHandlers = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onPause: (id: string) => void;
};

interface ProgramCardProps extends ProgramCardHandlers {
  program: Program;
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
    <Card className="glass hover:shadow-lg transition-shadow flex flex-col">
       <Link href={`/programs/${program.id}`} className="flex-grow flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline text-xl">{program.name}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">
                  {program.description || 'No description'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pb-3 flex-grow">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(program.startDate)} - {program.durationType === 'fixed' ? formatDate(program.endDate) : 'Ongoing'}
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
      </Link>

      <CardFooter className="pt-3 border-t flex items-center justify-between">
         <div className="text-sm text-muted-foreground">
          <span>{program.workouts.length} workouts</span>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(program.id)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {program.status === 'draft' && (
                <DropdownMenuItem onClick={() => onActivate(program.id)}>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
              {program.status === 'active' && (
                <DropdownMenuItem onClick={() => onPause(program.id)}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </DropdownMenuItem>
              )}
              {program.status === 'paused' && (
                <DropdownMenuItem onClick={() => onActivate(program.id)}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(program.id)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
