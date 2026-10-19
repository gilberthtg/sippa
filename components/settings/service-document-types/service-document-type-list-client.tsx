'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { removeServiceDocumentType, addServiceDocumentType } from '@/app/actions/master-data';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type ServiceDocType = {
  id: number;
  requestType: string;
  documentTypeId: number;
  documentTypeName: string | null;
  documentTypeActive: boolean | null;
  isRequired: boolean;
  sortOrder: number;
  createdAt: Date;
};

type DocumentType = {
  id: number;
  name: string;
  isActive: boolean;
};

type Props = {
  initialData: {
    serviceDocumentTypes: ServiceDocType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  documentTypes: DocumentType[];
};

export function ServiceDocumentTypeListClient({ initialData, documentTypes }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'new_application' | 'rfc'>('new_application');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ServiceDocType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const filtered = initialData.serviceDocumentTypes.filter((s) => s.requestType === activeTab);

  const handleAdd = async () => {
    if (!selectedDocTypeId) return;
    setIsAdding(true);
    try {
      await addServiceDocumentType({
        requestType: activeTab,
        documentTypeId: Number(selectedDocTypeId),
      });
      toast.success('Document type added');
      setAddDialogOpen(false);
      setSelectedDocTypeId('');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (item: ServiceDocType) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);
    try {
      await removeServiceDocumentType(selectedItem.id);
      toast.success('Mapping removed');
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove');
    } finally {
      setIsDeleting(false);
    }
  };

  const availableDocTypes = documentTypes.filter(
    (dt) =>
      dt.isActive &&
      !filtered.some((f) => f.documentTypeId === dt.id)
  );

  const tabLabel = activeTab === 'new_application' ? 'Pengembangan' : 'RFC';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'new_application' ? 'default' : 'outline'}
            onClick={() => setActiveTab('new_application')}
          >
            Pengembangan
          </Button>
          <Button
            variant={activeTab === 'rfc' ? 'default' : 'outline'}
            onClick={() => setActiveTab('rfc')}
          >
            RFC
          </Button>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add to {tabLabel}
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No document types mapped for {tabLabel}
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b py-3 last:border-0"
              >
                <div>
                  <div className="font-medium">{item.documentTypeName}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.isRequired ? 'Required' : 'Optional'} · Order: {item.sortOrder}
                  </div>
                </div>
                <div className="flex gap-2">
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
            ))
          )}
        </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Document Type to {tabLabel}</DialogTitle>
            <DialogDescription>
              Select a document type to require for {tabLabel} requests
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={selectedDocTypeId} onValueChange={(v) => setSelectedDocTypeId(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {availableDocTypes.map((dt) => (
                    <SelectItem key={dt.id} value={String(dt.id)}>
                      {dt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!selectedDocTypeId || isAdding}>
              {isAdding ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedItem && (
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Remove Mapping"
          description={`Remove "${selectedItem.documentTypeName}" from ${tabLabel}?`}
          confirmLabel={isDeleting ? 'Removing...' : 'Remove'}
          variant="destructive"
        />
      )}
    </div>
  );
}