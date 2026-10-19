'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { createDocumentType, updateDocumentType } from '@/app/actions/master-data';
import { toast } from 'sonner';

const documentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

type DocumentTypeForm = z.infer<typeof documentTypeSchema>;

type DocumentType = {
  id: number;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: DocumentType;
};

export function DocumentTypeDialog({ mode, open, onOpenChange, item }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DocumentTypeForm>({
    resolver: zodResolver(documentTypeSchema),
    defaultValues: {
      name: item?.name || '',
      sortOrder: item?.sortOrder || undefined,
      isActive: item?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      });
    } else {
      form.reset({
        name: '',
        sortOrder: undefined,
        isActive: true,
      });
    }
  }, [item, form]);

  const onSubmit = async (data: DocumentTypeForm) => {
    setIsLoading(true);
    try {
      if (mode === 'create') {
        await createDocumentType({
          name: data.name,
          sortOrder: data.sortOrder,
        });
        toast.success('Document type created successfully');
      } else {
        if (!item) return;
        await updateDocumentType(item.id, {
          name: data.name,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
        });
        toast.success('Document type updated successfully');
      }

      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} document type`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Document Type' : 'Edit Document Type'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new document type for service requirements'
              : 'Update document type information'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Permintaan Aplikasi, Project Plan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Display order in lists (lower numbers appear first)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {field.value ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Saving...'
                  : mode === 'create'
                    ? 'Create'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}