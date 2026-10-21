'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  toggleDevteamUnitActive,
  deleteDevteamUnit,
} from '@/app/actions/master-data';
import { toast } from 'sonner';
import { MasterDataSearch } from '../master-data/master-data-search';
import { MasterDataFilters } from '../master-data/master-data-filters';
import { DevteamUnitDialog } from './devteam-unit-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

type DevteamUnit = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  initialData: {
    devteamUnits: DevteamUnit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function DevteamUnitListClient({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DevteamUnit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (item: DevteamUnit) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (item: DevteamUnit) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);
    try {
      await deleteDevteamUnit(selectedItem.id);
      toast.success('DevTeam unit deleted successfully');
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete devteam unit');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (item: DevteamUnit) => {
    try {
      await toggleDevteamUnitActive(item.id, !item.isActive);
      toast.success(
        item.isActive
          ? 'DevTeam unit deactivated successfully'
          : 'DevTeam unit activated successfully'
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update devteam unit');
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/settings/devteam-units?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <MasterDataSearch type="devteam-units" />
          <MasterDataFilters />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add DevTeam Unit
        </Button>
      </div>

      <div className="rounded-md border">
        {initialData.devteamUnits.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No devteam units found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.devteamUnits.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {item.isActive ? (
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: localeId })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(item)}
                        title={item.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {item.isActive ? (
                          <ToggleLeft className="h-4 w-4" />
                        ) : (
                          <ToggleRight className="h-4 w-4" />
                        )}
                      </Button> */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {initialData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(initialData.page - 1) * initialData.limit + 1} to{' '}
            {Math.min(initialData.page * initialData.limit, initialData.total)} of{' '}
            {initialData.total}
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

      <DevteamUnitDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedItem && (
        <>
          <DevteamUnitDialog
            mode="edit"
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={selectedItem}
          />

          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDelete}
            title="Delete DevTeam Unit"
            description={`Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`}
            confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
            variant="destructive"
          />
        </>
      )}
    </div>
  );
}
