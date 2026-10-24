'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { MasterDataFilters } from '../master-data/master-data-filters';
import { MasterDataSearch } from '../master-data/master-data-search';
import { MasterDataDialog } from '../master-data/master-data-dialog';
import { useRouter, useSearchParams } from 'next/navigation';
import { reorderPriorities } from '@/app/actions/master-data';
import { toast } from 'sonner';

type Priority = {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  initialData: {
    priorities: Priority[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function PriorityListClient({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Priority | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const handleEdit = (item: Priority) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/settings/priorities?${params.toString()}`);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    setIsReordering(true);
    try {
      const newOrder = [...initialData.priorities];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      
      await reorderPriorities(newOrder.map(p => p.id));
      toast.success('Priority order updated');
      router.refresh();
    } catch {
      toast.error('Failed to reorder priorities');
    } finally {
      setIsReordering(false);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === initialData.priorities.length - 1) return;

    setIsReordering(true);
    try {
      const newOrder = [...initialData.priorities];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      
      await reorderPriorities(newOrder.map(p => p.id));
      toast.success('Priority order updated');
      router.refresh();
    } catch {
      toast.error('Failed to reorder priorities');
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <MasterDataSearch type="priorities" />
          <MasterDataFilters />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Prioritas
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          {initialData.priorities.map((priority, index) => (
            <div
              key={priority.id}
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
                    disabled={index === initialData.priorities.length - 1 || isReordering}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <div className="font-medium">{priority.name}</div>
                  <div className="text-sm text-muted-foreground">{priority.code}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Order: {priority.sortOrder}</span>
                <Button variant="outline" size="sm" onClick={() => handleEdit(priority)}>
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {initialData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(initialData.page - 1) * 20 + 1} to{' '}
            {Math.min(initialData.page * 20, initialData.total)} of {initialData.total} priorities
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

      <MasterDataDialog
        type="priorities"
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedItem && (
        <MasterDataDialog
          type="priorities"
          mode="edit"
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          item={selectedItem}
        />
      )}
    </div>
  );
}
