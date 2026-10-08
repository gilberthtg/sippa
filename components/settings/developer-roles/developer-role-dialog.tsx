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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { createDeveloperRole, updateDeveloperRole } from '@/app/actions/master-data';
import { toast } from 'sonner';

const developerRoleSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(10, 'Code too long')
    .regex(/^[A-Z]+$/, 'Code must be uppercase letters only (e.g., SA, TW, BE)'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

type DeveloperRoleForm = z.infer<typeof developerRoleSchema>;

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
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: DeveloperRole;
};

export function DeveloperRoleDialog({ mode, open, onOpenChange, item }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DeveloperRoleForm>({
    resolver: zodResolver(developerRoleSchema),
    defaultValues: {
      code: item?.code || '',
      name: item?.name || '',
      description: item?.description || '',
      sortOrder: item?.sortOrder || undefined,
      isActive: item?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        code: item.code,
        name: item.name,
        description: item.description || '',
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      });
    } else {
      form.reset({
        code: '',
        name: '',
        description: '',
        sortOrder: undefined,
        isActive: true,
      });
    }
  }, [item, form]);

  const onSubmit = async (data: DeveloperRoleForm) => {
    setIsLoading(true);

    try {
      if (mode === 'create') {
        await createDeveloperRole({
          code: data.code,
          name: data.name,
          description: data.description || undefined,
          sortOrder: data.sortOrder,
        });
        toast.success('Developer role created successfully');
      } else {
        if (!item) return;

        await updateDeveloperRole(item.id, {
          code: data.code,
          name: data.name,
          description: data.description || undefined,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
        });
        toast.success('Developer role updated successfully');
      }

      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to ${mode} developer role`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Developer Role' : 'Edit Developer Role'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new developer role to the system (SA, TW, BE, FE, QA, DM)'
              : 'Update developer role information'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., SA, TW, BE, FE, QA, DM"
                      {...field}
                      disabled={mode === 'edit'}
                    />
                  </FormControl>
                  <FormDescription>
                    2-3 uppercase letters (cannot be changed after creation)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., System Analyst, Backend Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the role and responsibilities"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
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
                        {field.value
                          ? 'Role is active and can be assigned'
                          : 'Role is inactive (cannot deactivate if in use)'}
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
                    ? 'Create Role'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
