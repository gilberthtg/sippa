'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { bulkImportSLAHolidays } from '@/app/actions/master-data';
import { toast } from 'sonner';
import { Upload, AlertCircle } from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SLAHolidayBulkDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const handleImport = async () => {
    setParseError(null);

    if (!csvData.trim()) {
      setParseError('Please enter CSV data');
      return;
    }

    // Parse CSV (simple parsing - assumes comma-separated)
    const lines = csvData.trim().split('\n');
    const holidays: Array<{ holidayDate: string; description: string }> = [];

    // Skip header if first line looks like a header
    const startIndex =
      lines[0]?.toLowerCase().includes('date') || lines[0]?.toLowerCase().includes('description')
        ? 1
        : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (doesn't handle quoted commas)
      const parts = line.split(',').map((p) => p.trim());

      if (parts.length < 2) {
        setParseError(`Line ${i + 1}: Invalid format. Expected: date,description`);
        return;
      }

      const [date, ...descParts] = parts;
      const description = descParts.join(','); // Rejoin in case description had commas

      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        setParseError(
          `Line ${i + 1}: Invalid date format "${date}". Expected: YYYY-MM-DD (e.g., 2024-12-25)`
        );
        return;
      }

      holidays.push({
        holidayDate: date,
        description: description || 'No description',
      });
    }

    if (holidays.length === 0) {
      setParseError('No valid holidays found in CSV data');
      return;
    }

    if (holidays.length > 500) {
      setParseError('Too many holidays. Maximum 500 per import.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await bulkImportSLAHolidays(holidays);
      toast.success(
        `Successfully imported ${result.imported} holidays${result.skipped > 0 ? ` (${result.skipped} skipped as duplicates)` : ''}`
      );
      onOpenChange(false);
      setCsvData('');
      setParseError(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import holidays');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
      setParseError(null);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Holidays</DialogTitle>
          <DialogDescription>
            Import multiple holidays at once using CSV format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Upload CSV File</label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="mt-1 text-xs text-muted-foreground">Or paste CSV data below</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">CSV Data</label>
            <Textarea
              placeholder="2024-12-25,Hari Raya Natal&#10;2024-08-17,Hari Kemerdekaan RI&#10;2024-01-01,Tahun Baru Masehi"
              value={csvData}
              onChange={(e) => {
                setCsvData(e.target.value);
                setParseError(null);
              }}
              className="min-h-[200px] font-mono text-xs"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Format: date,description (one per line). Date must be YYYY-MM-DD.
            </p>
          </div>

          {parseError && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-medium">Parse Error</div>
                <div className="mt-1">{parseError}</div>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <p className="font-medium">📝 CSV Format</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>First line can be a header (will be auto-detected and skipped)</li>
              <li>Each line: date,description</li>
              <li>Date format: YYYY-MM-DD (e.g., 2024-12-25)</li>
              <li>Duplicate dates will be skipped automatically</li>
              <li>Maximum 500 holidays per import</li>
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Example:</p>
            <pre className="mt-2 font-mono text-xs">
              2024-01-01,Tahun Baru Masehi{'\n'}2024-12-25,Hari Raya Natal{'\n'}
              2024-08-17,Hari Kemerdekaan RI
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isLoading || !csvData.trim()}>
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? 'Importing...' : 'Import Holidays'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
