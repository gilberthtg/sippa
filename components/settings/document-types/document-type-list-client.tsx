'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteDocumentType } from '@/app/actions/master-data';
import { toast } from 'sonner';
import { MasterDataSearch } from '../master-data/master-data-search';
import { MasterDataFilters } from '../master-data/master-data-filters';
import { DocumentTypeDialog } from './document-type-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

type DocumentType = {
  id: number;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  initialData: {
    documentTypes: DocumentType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function DocumentTypeListClient({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DocumentType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (item: DocumentType) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (item: DocumentType) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);
    try {
      await deleteDocumentType(selectedItem.id);
      toast.success('Document type deleted successfully');
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete document type');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/settings/document-types?${params.toString()}`);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    try {
      const newOrder = [...initialData.documentTypes];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      // reuse reorder not available for document types, just update sort via update
      await Promise.all(newOrder.map((d, i) => import('@/app/actions/master-data').then(m => m.updateDocumentType(d.id, { sortOrder: i }))));
      toast.success('Order updated');
      router.refresh();
    } catch {
      toast.error('Failed to reorder');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === initialData.documentTypes.length - 1) return;
    try {
      const newOrder = [...initialData.documentTypes];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      await Promise.all(newOrder.map((d, i) => import('@/app/actions/master-data').then(m => m.updateDocumentType(d.id, { sortOrder: i }))));
      toast.success('Order updated');
      router.refresh();
    } catch {
      toast.error('Failed to reorder');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <MasterDataSearch type="document-types" />
          <MasterDataFilters />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Document Type
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          {initialData.documentTypes.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No document types found
            </div>
          ) : (
            initialData.documentTypes.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b py-3 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === initialData.documentTypes.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">Order: {item.sortOrder}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${item.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item)}
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
            {Math.min(initialData.page * 20, initialData.total)} of {initialData.total}
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

      <DocumentTypeDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedItem && (
        <>
          <DocumentTypeDialog
            mode="edit"
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={selectedItem}
          />

          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDelete}
            title="Delete Document Type"
            description={`Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`}
            confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
            variant="destructive"
          />
        </>
      )}
    </div>
  );
}