'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { reorderDeveloperRoles, deleteDeveloperRole } from '@/app/actions/master-data';
import { toast } from 'sonner';
import { MasterDataSearch } from '../master-data/master-data-search';
import { MasterDataFilters } from '../master-data/master-data-filters';
import { DeveloperRoleDialog } from './developer-role-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { RoleBadge } from '@/components/shared/role-badge';

type DeveloperRole = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  initialData: {
    roles: DeveloperRole[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function DeveloperRoleListClient({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DeveloperRole | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (item: DeveloperRole) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (item: DeveloperRole) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      await deleteDeveloperRole(selectedItem.id);
      toast.success('Developer role deleted successfully');
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete developer role');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/settings/developer-roles?${params.toString()}`);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    setIsReordering(true);
    try {
      const newOrder = [...initialData.roles];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

      await reorderDeveloperRoles(newOrder.map((r) => r.id));
      toast.success('Developer role order updated');
      router.refresh();
    } catch {
      toast.error('Failed to reorder developer roles');
    } finally {
      setIsReordering(false);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === initialData.roles.length - 1) return;

    setIsReordering(true);
    try {
      const newOrder = [...initialData.roles];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

      await reorderDeveloperRoles(newOrder.map((r) => r.id));
      toast.success('Developer role order updated');
      router.refresh();
    } catch {
      toast.error('Failed to reorder developer roles');
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <MasterDataSearch type="developer-roles" />
          <MasterDataFilters />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Developer Role
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          {initialData.roles.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No developer roles found
            </div>
          ) : (
            initialData.roles.map((role, index) => (
              <div
                key={role.id}
                className="flex items-center justify-between border-b py-3 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || isReordering}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === initialData.roles.length - 1 || isReordering}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <RoleBadge roleCode={role.code} />
                    <div>
                      <div className="font-medium">{role.name}</div>
                      {role.description && (
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Order: {role.sortOrder}
                  </span>
                  <span
                    className={`text-sm ${role.isActive ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {role.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(role)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(role)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {initialData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(initialData.page - 1) * 20 + 1} to{' '}
            {Math.min(initialData.page * 20, initialData.total)} of {initialData.total} roles
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

      <DeveloperRoleDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedItem && (
        <>
          <DeveloperRoleDialog
            mode="edit"
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={selectedItem}
          />

          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDelete}
            title="Delete Developer Role"
            description={`Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`}
            confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
            variant="destructive"
          />
        </>
      )}
    </div>
  );
}
