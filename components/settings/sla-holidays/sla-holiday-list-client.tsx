'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Upload, Download, Calendar as CalendarIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteSLAHoliday, bulkDeleteSLAHolidays, importIndonesianHolidays } from '@/app/actions/master-data';
import { toast } from 'sonner';
import { MasterDataSearch } from '../master-data/master-data-search';
import { MasterDataFilters } from '../master-data/master-data-filters';
import { SLAHolidayDialog } from './sla-holiday-dialog';
import { SLAHolidayBulkDialog } from './sla-holiday-bulk-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SLAHoliday = {
  id: number;
  holidayDate: Date | string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  initialData: {
    holidays: SLAHoliday[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    year: number;
  };
};

export function SLAHolidayListClient({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SLAHoliday | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const currentYear = initialData.year;

  const handleEdit = (item: SLAHoliday) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (item: SLAHoliday) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      await deleteSLAHoliday(selectedItem.id);
      toast.success('Holiday deleted successfully');
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete holiday');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await bulkDeleteSLAHolidays(currentYear);
      toast.success(`${result.deletedCount} holidays deleted for year ${currentYear}`);
      setBulkDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete holidays');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportIndonesian = async () => {
    setIsImporting(true);
    try {
      const result = await importIndonesianHolidays(currentYear);
      toast.success(
        `Imported ${result.imported} holidays${result.skipped > 0 ? ` (${result.skipped} skipped as duplicates)` : ''}`
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import holidays');
    } finally {
      setIsImporting(false);
    }
  };

  const handleYearChange = (year: string | null) => {
    if (!year) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', year);
    params.delete('page');
    router.push(`/admin/settings/sla-holidays?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/settings/sla-holidays?${params.toString()}`);
  };

  const handleExportCSV = () => {
    const csv = [
      ['Date', 'Description', 'Status'],
      ...initialData.holidays.map((h) => [
        h.holidayDate,
        h.description,
        h.isActive ? 'Active' : 'Inactive',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sla-holidays-${currentYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate year options (current year ± 5 years)
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <Select value={String(currentYear)} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[140px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <MasterDataSearch type="sla-holidays" />
          <MasterDataFilters />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={initialData.holidays.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportIndonesian}
            disabled={isImporting}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isImporting ? 'Importing...' : 'Import ID Holidays'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBulkDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Year
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Holiday
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium">Date</th>
                <th className="p-3 text-left font-medium">Description</th>
                <th className="p-3 text-left font-medium">Day</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialData.holidays.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No holidays found for {currentYear}. Add holidays or import from preset.
                  </td>
                </tr>
              ) : (
                initialData.holidays.map((holiday) => (
                  <tr key={holiday.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3 font-medium">
                      {format(new Date(holiday.holidayDate), 'dd MMM yyyy', {
                        locale: localeId,
                      })}
                    </td>
                    <td className="p-3">{holiday.description}</td>
                    <td className="p-3 text-muted-foreground">
                      {format(new Date(holiday.holidayDate), 'EEEE', { locale: localeId })}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-sm ${holiday.isActive ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {holiday.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(holiday)}>
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(holiday)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {initialData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(initialData.page - 1) * initialData.limit + 1} to{' '}
            {Math.min(initialData.page * initialData.limit, initialData.total)} of{' '}
            {initialData.total} holidays
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(initialData.page - 1)}
              disabled={initialData.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {initialData.page} of {initialData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(initialData.page + 1)}
              disabled={initialData.page === initialData.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <SLAHolidayDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedItem && (
        <>
          <SLAHolidayDialog
            mode="edit"
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={selectedItem}
          />

          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDelete}
            title="Delete Holiday"
            description={`Are you sure you want to delete "${selectedItem.description}" on ${format(new Date(selectedItem.holidayDate), 'dd MMM yyyy', { locale: localeId })}?`}
            confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
            variant="destructive"
          />
        </>
      )}

      <SLAHolidayBulkDialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen} />

      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={confirmBulkDelete}
        title="Delete All Holidays"
        description={`Are you sure you want to delete ALL holidays for year ${currentYear}? This will remove ${initialData.total} holiday(s). This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete All'}
        variant="destructive"
      />
    </div>
  );
}
