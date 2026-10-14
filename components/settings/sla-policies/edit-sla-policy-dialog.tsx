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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { updateSLAPolicy } from '@/app/actions/sla-policies';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const editSLAPolicySchema = z.object({
  requestType: z.enum(['new_application', 'rfc']).refine(val => !!val, { message: 'Request type is required' }),
  priorityId: z.number().refine(val => !!val, { message: 'Priority is required' }),
  targetBusinessDays: z.number().min(1, 'Target business days must be at least 1').max(365, 'Target business days cannot exceed 1 year'),
  effectiveFrom: z.string().nullable(),
  effectiveTo: z.string().nullable(),
  isActive: z.boolean(),
}).refine((data) => {
  if (data.effectiveFrom && data.effectiveTo) {
    return new Date(data.effectiveFrom) <= new Date(data.effectiveTo);
  }
  return true;
}, {
  message: 'Effective To must be after Effective From',
  path: ['effectiveTo'],
});

type EditSLAPolicyForm = z.infer<typeof editSLAPolicySchema>;

type SLAPolicy = {
  id: number;
  requestType: string | null;
  priorityId: number | null;
  targetBusinessDays: number;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  isActive: boolean;
};

type Priority = {
  id: number;
  name: string;
  code: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: SLAPolicy;
  priorities: Priority[];
};

export function EditSLAPolicyDialog({ open, onOpenChange, policy, priorities }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditSLAPolicyForm>({
    resolver: zodResolver(editSLAPolicySchema),
    defaultValues: {
      requestType: (policy.requestType as 'new_application' | 'rfc') || undefined,
      priorityId: policy.priorityId || undefined,
      targetBusinessDays: policy.targetBusinessDays,
      effectiveFrom: policy.effectiveFrom ? format(new Date(policy.effectiveFrom), 'yyyy-MM-dd') : null,
      effectiveTo: policy.effectiveTo ? format(new Date(policy.effectiveTo), 'yyyy-MM-dd') : null,
      isActive: policy.isActive,
    },
  });

  useEffect(() => {
    form.reset({
      requestType: (policy.requestType as 'new_application' | 'rfc') || undefined,
      priorityId: policy.priorityId || undefined,
      targetBusinessDays: policy.targetBusinessDays,
      effectiveFrom: policy.effectiveFrom ? format(new Date(policy.effectiveFrom), 'yyyy-MM-dd') : null,
      effectiveTo: policy.effectiveTo ? format(new Date(policy.effectiveTo), 'yyyy-MM-dd') : null,
      isActive: policy.isActive,
    });
  }, [policy, form]);

  const onSubmit = async (data: EditSLAPolicyForm) => {
    setIsLoading(true);

    try {
      await updateSLAPolicy(policy.id, data);
      toast.success('SLA policy updated successfully');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update SLA policy');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit SLA Policy</DialogTitle>
          <DialogDescription>Update SLA policy information</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select request type">
                          {field.value === 'new_application' && 'New Application'}
                          {field.value === 'rfc' && 'RFC - Request for Change'}
                          {!field.value && 'Select request type'}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new_application">
                        <div className="flex flex-col py-1">
                          <span className="font-medium">New Application</span>
                          <span className="text-xs text-muted-foreground">Aplikasi baru yang belum pernah ada</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="rfc">
                        <div className="flex flex-col py-1">
                          <span className="font-medium">RFC</span>
                          <span className="text-xs text-muted-foreground">Request for Change - perubahan aplikasi</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priorityId"
              render={({ field }) => {
                const selectedPriority = priorities.find(p => p.id === field.value);
                return (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority">
                            {selectedPriority ? `${selectedPriority.code} - ${selectedPriority.name}` : 'Select priority'}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.id} value={priority.id.toString()}>
                            <div className="flex flex-col py-1">
                              <span className="font-medium">{priority.code}</span>
                              <span className="text-xs text-muted-foreground">{priority.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="targetBusinessDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target (Business Days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Maximum business days (Mon-Fri, excluding holidays) to complete the request</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effectiveFrom"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Effective From</FormLabel>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effectiveTo"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Effective To</FormLabel>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(new Date(field.value), 'PPP') : <span>No end date (indefinite)</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      {field.value ? 'Policy is active' : 'Policy is inactive'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

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
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
