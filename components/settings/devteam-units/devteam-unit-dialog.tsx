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
import { createDevteamUnit, updateDevteamUnit } from '@/app/actions/master-data';
import { toast } from 'sonner';

const devteamUnitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  isActive: z.boolean().optional(),
});

type DevteamUnitForm = z.infer<typeof devteamUnitSchema>;

type DevteamUnit = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: DevteamUnit;
};

export function DevteamUnitDialog({ mode, open, onOpenChange, item }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DevteamUnitForm>({
    resolver: zodResolver(devteamUnitSchema),
    defaultValues: {
      name: item?.name || '',
      isActive: item?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        isActive: item.isActive,
      });
    } else {
      form.reset({
        name: '',
        isActive: true,
      });
    }
  }, [item, form]);

  const onSubmit = async (data: DevteamUnitForm) => {
    setIsLoading(true);
    try {
      if (mode === 'create') {
        await createDevteamUnit({ name: data.name });
        toast.success('DevTeam unit created successfully');
      } else {
        if (!item) return;
        await updateDevteamUnit(item.id, {
          name: data.name,
          isActive: data.isActive,
        });
        toast.success('DevTeam unit updated successfully');
      }

      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} devteam unit`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create DevTeam Unit' : 'Edit DevTeam Unit'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new DevTI urusan to the system'
              : 'Update DevTI urusan information'}
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
                    <Input
                      placeholder="e.g., Urusan Pengembangan Produk TI Akademik"
                      {...field}
                    />
                  </FormControl>
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
                        {field.value ? 'DevTeam unit is active' : 'DevTeam unit is inactive'}
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
