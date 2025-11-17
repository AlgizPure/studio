'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { exportHabitsForClaude, downloadClaudeAnalysisYAML } from '@/lib/habits/export-claude';
import {
  exportHabitsJSON,
  downloadHabitsBackupJSON,
  validateHabitsBackup,
  importHabitsJSON,
  type HabitsBackup,
} from '@/lib/habits/import-export';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Download, Upload, FileText } from 'lucide-react';

export function ExportDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('claude');

  // Claude export state
  const [claudeExporting, setClaudeExporting] = useState(false);

  // JSON export state
  const [jsonExporting, setJsonExporting] = useState(false);
  const [daysBack, setDaysBack] = useState('90');

  // Import state
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationDetails, setValidationDetails] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<{
    habitsAdded: number;
    habitsSkipped: number;
    logsAdded: number;
    logsSkipped: number;
    errors: string[];
  } | null>(null);

  // Handle Claude Analysis Export (YAML)
  const handleClaudeExport = async () => {
    if (!user || !firestore) return;

    setClaudeExporting(true);
    try {
      const yamlContent = await exportHabitsForClaude({
        firestore,
        userId: user.uid,
      });

      downloadClaudeAnalysisYAML(yamlContent);

      toast({
        title: 'Claude Analysis Exported',
        description: 'YAML file downloaded. Upload to Claude for life coaching analysis.',
      });
    } catch (error) {
      console.error('Claude export failed:', error);
      toast({
        title: 'Export Failed',
        description: `Failed to export for Claude: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setClaudeExporting(false);
    }
  };

  // Handle JSON Backup Export
  const handleJSONExport = async () => {
    if (!user || !firestore) return;

    setJsonExporting(true);
    try {
      const days = parseInt(daysBack, 10) || 90;
      const backup = await exportHabitsJSON({
        firestore,
        userId: user.uid,
        daysBack: days,
      });

      downloadHabitsBackupJSON(backup);

      toast({
        title: 'Backup Exported',
        description: `${backup.metadata.totalHabits} habits and ${backup.metadata.totalLogs} logs exported.`,
      });
    } catch (error) {
      console.error('JSON export failed:', error);
      toast({
        title: 'Export Failed',
        description: `Failed to export backup: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setJsonExporting(false);
    }
  };

  // Handle file selection for import
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setValidationError(null);
    setValidationDetails([]);
    setImportResult(null);

    // Validate file immediately
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const validation = validateHabitsBackup(json);

      if (!validation.success) {
        setValidationError(validation.error);
        setValidationDetails(validation.details || []);
      }
    } catch (error) {
      setValidationError('Invalid JSON file');
    }
  };

  // Handle JSON Import
  const handleJSONImport = async () => {
    if (!user || !firestore || !importFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await importFile.text();
      const json = JSON.parse(text);
      const validation = validateHabitsBackup(json);

      if (!validation.success) {
        setValidationError(validation.error);
        setValidationDetails(validation.details || []);
        setImporting(false);
        return;
      }

      const result = await importHabitsJSON({
        firestore,
        userId: user.uid,
        backup: validation.data,
      });

      setImportResult(result);

      if (result.errors.length === 0) {
        toast({
          title: 'Import Successful',
          description: `Added ${result.habitsAdded} habits and ${result.logsAdded} logs.`,
        });
      } else {
        toast({
          title: 'Import Completed with Errors',
          description: `Added ${result.habitsAdded} habits, but ${result.errors.length} errors occurred.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: 'Import Failed',
        description: `Failed to import backup: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Export / Import</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export & Import Habits</DialogTitle>
          <DialogDescription>
            Export for Claude analysis, backup habits, or import from backup.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="claude">Claude Analysis</TabsTrigger>
            <TabsTrigger value="export">Backup Export</TabsTrigger>
            <TabsTrigger value="import">Import Backup</TabsTrigger>
          </TabsList>

          {/* Tab 1: Claude Analysis (YAML) */}
          <TabsContent value="claude" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">Claude Life Coach Analysis</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Export your habits, daily reflections, and Wheel of Life data to YAML format for
                    comprehensive life coaching analysis by Claude.
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>What's included:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>All habits with completion rates and streaks</li>
                    <li>Daily reflections summary (last 30 days)</li>
                    <li>Wheel of Life scores (last 8 weeks)</li>
                    <li>Embedded Claude coaching prompt</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">How to use:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Click "Export for Claude" to download YAML file</li>
                  <li>Upload the YAML file to Claude (claude.ai or API)</li>
                  <li>Claude will analyze your data and provide personalized coaching</li>
                </ol>
              </div>

              <Button
                onClick={handleClaudeExport}
                disabled={claudeExporting}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {claudeExporting ? 'Exporting...' : 'Export for Claude (YAML)'}
              </Button>
            </div>
          </TabsContent>

          {/* Tab 2: JSON Backup Export */}
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Download className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">Backup Your Habits</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Export all habits and recent logs to JSON format for backup and migration.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label className="text-right">Days back</Label>
                  <Input
                    type="number"
                    className="col-span-3"
                    value={daysBack}
                    onChange={(e) => setDaysBack(e.target.value)}
                    placeholder="90"
                    min="1"
                    max="365"
                  />
                </div>
                <p className="text-xs text-muted-foreground col-span-4 ml-[25%]">
                  Include logs from the last {daysBack} days (default: 90)
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>What's included:</strong> All habits (active and archived) + logs from the
                  specified period.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleJSONExport}
                disabled={jsonExporting}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {jsonExporting ? 'Exporting...' : 'Download Backup (JSON)'}
              </Button>
            </div>
          </TabsContent>

          {/* Tab 3: Import Backup */}
          <TabsContent value="import" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Upload className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">Import Backup</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Restore habits and logs from a JSON backup file.
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Merge strategy:</strong> New habits are added. Habits with duplicate names
                  are skipped. Logs are added if no existing log for the same habit + date.
                </AlertDescription>
              </Alert>

              <div className="grid gap-3">
                <Label htmlFor="import-file">Select backup file (JSON)</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                />
              </div>

              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Validation error:</strong> {validationError}
                    {validationDetails.length > 0 && (
                      <ul className="list-disc list-inside mt-2 text-xs">
                        {validationDetails.slice(0, 5).map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                        {validationDetails.length > 5 && (
                          <li>... and {validationDetails.length - 5} more errors</li>
                        )}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {importFile && !validationError && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-sm">
                    File validated successfully: <strong>{importFile.name}</strong>
                  </AlertDescription>
                </Alert>
              )}

              {importResult && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-sm">
                    <strong>Import complete:</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>{importResult.habitsAdded} habits added</li>
                      <li>{importResult.habitsSkipped} habits skipped (duplicates)</li>
                      <li>{importResult.logsAdded} logs added</li>
                      <li>{importResult.logsSkipped} logs skipped</li>
                    </ul>
                    {importResult.errors.length > 0 && (
                      <div className="mt-2 text-destructive">
                        <strong>Errors ({importResult.errors.length}):</strong>
                        <ul className="list-disc list-inside text-xs">
                          {importResult.errors.slice(0, 3).map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                          {importResult.errors.length > 3 && (
                            <li>... and {importResult.errors.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleJSONImport}
                disabled={importing || !importFile || !!validationError}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {importing ? 'Importing...' : 'Import Backup'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
