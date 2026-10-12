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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  createUnit, 
  updateUnit, 
  // Teams feature deprecated in Phase 1 - functions commented out
  // createTeam, 
  // updateTeam, 
  createPriority, 
  updatePriority 
} from '@/app/actions/master-data';
import { toast } from 'sonner';

const masterDataSchema = z.object({
  code: z.string()
    .min(1, 'Code is required')
    .max(50, 'Code too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Code must be alphanumeric with underscores only'),
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

type MasterDataForm = z.infer<typeof masterDataSchema>;

type MasterDataItem = {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  type: 'units' | 'teams' | 'priorities';
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MasterDataItem;
};

const typeLabels = {
  units: { singular: 'Unit', plural: 'Units' },
  teams: { singular: 'Team', plural: 'Teams' },
  priorities: { singular: 'Priority', plural: 'Priorities' },
};

export function MasterDataDialog({ type, mode, open, onOpenChange, item }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const label = typeLabels[type];

  const form = useForm<MasterDataForm>({
    resolver: zodResolver(masterDataSchema),
    defaultValues: {
      code: item?.code || '',
      name: item?.name || '',
      sortOrder: item?.sortOrder || undefined,
      isActive: item?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        code: item.code,
        name: item.name,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      });
    } else {
      form.reset({
        code: '',
        name: '',
        sortOrder: undefined,
        isActive: true,
      });
    }
  }, [item, form]);

  const onSubmit = async (data: MasterDataForm) => {
    setIsLoading(true);

    try {
      if (mode === 'create') {
        if (type === 'units') {
          await createUnit({ code: data.code, name: data.name });
        } else if (type === 'teams') {
          // Teams feature deprecated
          toast.error('Teams feature has been deprecated. Use individual developer assignments instead.');
          setIsLoading(false);
          return;
        } else if (type === 'priorities') {
          await createPriority({ 
            code: data.code, 
            name: data.name, 
            sortOrder: data.sortOrder 
          });
        }
        toast.success(`${label.singular} created successfully`);
      } else {
        if (!item) return;
        
        if (type === 'units') {
          await updateUnit(item.id, data);
        } else if (type === 'teams') {
          // Teams feature deprecated
          toast.error('Teams feature has been deprecated. Use individual developer assignments instead.');
          setIsLoading(false);
          return;
        } else if (type === 'priorities') {
          await updatePriority(item.id, data);
        }
        toast.success(`${label.singular} updated successfully`);
      }

      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} ${label.singular.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? `Create ${label.singular}` : `Edit ${label.singular}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? `Add a new ${label.singular.toLowerCase()} to the system` 
              : `Update ${label.singular.toLowerCase()} information`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., LOW, CRITICAL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'priorities' && (
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
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {field.value ? `${label.singular} is active` : `${label.singular} is inactive`}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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
                  ? mode === 'create' ? 'Creating...' : 'Saving...' 
                  : mode === 'create' ? `Create ${label.singular}` : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
