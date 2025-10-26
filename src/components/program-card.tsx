'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Program } from '@/lib/types';
import { Badge } from './ui/badge';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-2xl">{program.name}</CardTitle>
            {program.isTemplate && <Badge variant="secondary">Template</Badge>}
        </div>
        <CardDescription className="h-10 text-ellipsis overflow-hidden">{program.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* We can add more details here later, like workout count */}
        <div className="text-sm text-muted-foreground">
            <p>3 Workouts / Week</p>
            <p>6 Weeks</p>
        </div>
      </CardContent>
      <CardFooter>
        {program.isTemplate ? (
            <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add to My Programs
            </Button>
        ) : (
            <Button variant="outline" className="w-full" asChild>
                <Link href={`/programs/${program.id}`}>View Program</Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
