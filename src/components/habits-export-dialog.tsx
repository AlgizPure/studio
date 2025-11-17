'use client';

import React, { useState, useRef } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, addDoc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Habit, DailyReflection, WeeklyContext } from '@/lib/types';
import { exportHabitsForClaude, downloadYAML } from '@/lib/habits/export-claude';
import {
  exportHabitsToJSON,
  downloadJSON,
  parseJSONFile,
  validateHabitsImport,
  importHabitsFromJSON,
  type HabitsExport,
} from '@/lib/habits/import-export';
import { Download, Upload, Sparkles, FileJson, Loader2 } from 'lucide-react';

interface HabitsExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
  reflections: DailyReflection[];
  weeklyContexts: WeeklyContext[];
  onImportComplete?: () => void;
}

/**
 * Habits Export/Import Dialog Component
 *
 * Three tabs:
 * 1. Claude Analysis Export (YAML)
 * 2. JSON Backup Export
 * 3. JSON Import (with validation)
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Functions: 13.9 (Claude Export) + 13.10 (Import/Export) - Stage 6
 * Reference: docs/requirements/13_habit_tracker_requirements.md
 */
export function HabitsExportDialog({
  open,
  onOpenChange,
  habits,
  reflections,
  weeklyContexts,
  onImportComplete,
}: HabitsExportDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClaudeExport = () => {
    if (!user) return;

    try {
      const yaml = exportHabitsForClaude(
        habits,
        reflections,
        weeklyContexts,
        user.uid
      );

      downloadYAML(yaml);

      toast({
        title: 'Export Successful',
        description: `Exported ${habits.length} habits for Claude analysis. Send the YAML file to Claude for personalized coaching!`,
      });
    } catch (error) {
      console.error('Claude export failed:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const handleJSONExport = () => {
    if (!user) return;

    try {
      const exportData = exportHabitsToJSON(habits, { periodDays: 90 });
      downloadJSON(exportData);

      toast({
        title: 'Backup Created',
        description: `Exported ${habits.length} habits to JSON. Use this for backup or sharing.`,
      });
    } catch (error) {
      console.error('JSON export failed:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const handleJSONImport = async (file: File) => {
    if (!user || !firestore) return;

    setImporting(true);
    try {
      // Parse file
      const data = await parseJSONFile(file);

      // Validate
      const validation = validateHabitsImport(data);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid file format');
      }

      const importData = validation.data as HabitsExport;

      // Import with merge strategy
      const { habitsToAdd, skipped, summary } = importHabitsFromJSON(
        importData,
        habits,
        user.uid
      );

      if (habitsToAdd.length === 0) {
        toast({
          title: 'No New Habits',
          description: 'All habits in the import file already exist.',
        });
        return;
      }

      // Add habits to Firestore
      const habitsRef = collection(firestore, `users/${user.uid}/habits`);
      await Promise.all(
        habitsToAdd.map(habit => addDoc(habitsRef, habit))
      );

      toast({
        title: 'Import Successful',
        description: summary,
      });

      if (skipped.length > 0) {
        console.log('Skipped duplicates:', skipped);
      }

      onOpenChange(false);
      onImportComplete?.();
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import data',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleJSONImport(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export & Import Habits</DialogTitle>
          <DialogDescription>
            Export your habits for Claude analysis or create a JSON backup
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="claude" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="claude">
              <Sparkles className="mr-2 h-4 w-4" />
              Claude
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="mr-2 h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Claude Analysis Export */}
          <TabsContent value="claude" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-md border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium mb-1">Get Personalized Life Coaching from Claude</p>
                  <p className="text-muted-foreground text-xs">
                    Export your habits, daily reflections, and life balance data to YAML format.
                    The file includes an embedded prompt for Claude to act as your life coach.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium">What's included:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>{habits.length} habits with completion rates & streaks</li>
                  <li>Daily reflections summary (last 30 days)</li>
                  <li>Wheel of Life balance scores (last 8 weeks)</li>
                  <li>Embedded life coach prompt for Claude</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-md text-xs space-y-2">
                <p className="font-medium">How to use:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Click "Export for Claude" to download the YAML file</li>
                  <li>Open Claude.ai or Claude Code</li>
                  <li>Upload the YAML file and ask Claude to analyze it</li>
                  <li>Receive personalized life coaching recommendations!</li>
                </ol>
              </div>

              <Button
                onClick={handleClaudeExport}
                disabled={habits.length === 0}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Export for Claude Analysis
              </Button>
            </div>
          </TabsContent>

          {/* Tab 2: JSON Export */}
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-md border border-blue-500/20">
                <FileJson className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium mb-1">Create JSON Backup</p>
                  <p className="text-muted-foreground text-xs">
                    Export all your habits to a JSON file for backup or sharing with other devices.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium">Export includes:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>{habits.length} habits with all settings</li>
                  <li>Streaks and completion status</li>
                  <li>Icons, colors, and descriptions</li>
                  <li>Last 90 days of data</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-md text-xs">
                <p className="font-medium mb-2">Use cases:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Backup before making changes</li>
                  <li>Share habit templates with friends</li>
                  <li>Transfer data to a new device</li>
                  <li>Version control for your habits</li>
                </ul>
              </div>

              <Button
                onClick={handleJSONExport}
                disabled={habits.length === 0}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export to JSON
              </Button>
            </div>
          </TabsContent>

          {/* Tab 3: JSON Import */}
          <TabsContent value="import" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-green-500/10 rounded-md border border-green-500/20">
                <Upload className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium mb-1">Import Habits from JSON</p>
                  <p className="text-muted-foreground text-xs">
                    Upload a previously exported JSON file to restore or add new habits.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium">Import behavior:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>New habits are added to your collection</li>
                  <li>Duplicates (same name) are skipped</li>
                  <li>Streaks and completion status are reset</li>
                  <li>File is validated before import</li>
                </ul>
              </div>

              <div className="bg-orange-500/10 p-4 rounded-md text-xs border border-orange-500/20">
                <p className="font-medium mb-2">⚠️ Important:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Only JSON files exported from Zenith Trainer are supported</li>
                  <li>Invalid files will be rejected</li>
                  <li>Create a backup before importing (Export tab)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-file">Choose JSON file</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={importing}
                />
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                variant="outline"
                className="w-full"
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Select File to Import
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
