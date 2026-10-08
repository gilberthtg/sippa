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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createSLAHoliday, updateSLAHoliday } from '@/app/actions/master-data';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const slaHolidaySchema = z.object({
  holidayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  description: z.string().min(1, 'Description is required').max(255, 'Description too long'),
  isActive: z.boolean().optional(),
});

type SLAHolidayForm = z.infer<typeof slaHolidaySchema>;

type SLAHoliday = {
  id: number;
  holidayDate: Date | string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: SLAHoliday;
};

export function SLAHolidayDialog({ mode, open, onOpenChange, item }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    item ? new Date(item.holidayDate) : undefined
  );

  const form = useForm<SLAHolidayForm>({
    resolver: zodResolver(slaHolidaySchema),
    defaultValues: {
      holidayDate: item ? (typeof item.holidayDate === 'string' ? item.holidayDate : format(item.holidayDate, 'yyyy-MM-dd')) : '',
      description: item?.description || '',
      isActive: item?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (item) {
      const dateString = typeof item.holidayDate === 'string' 
        ? item.holidayDate 
        : format(item.holidayDate, 'yyyy-MM-dd');
      form.reset({
        holidayDate: dateString,
        description: item.description,
        isActive: item.isActive,
      });
      setDate(new Date(dateString));
    } else {
      form.reset({
        holidayDate: '',
        description: '',
        isActive: true,
      });
      setDate(undefined);
    }
  }, [item, form]);

  const onSubmit = async (data: SLAHolidayForm) => {
    setIsLoading(true);

    try {
      if (mode === 'create') {
        await createSLAHoliday({
          holidayDate: data.holidayDate,
          description: data.description,
        });
        toast.success('Holiday created successfully');
      } else {
        if (!item) return;

        await updateSLAHoliday(item.id, {
          holidayDate: data.holidayDate,
          description: data.description,
          isActive: data.isActive,
        });
        toast.success('Holiday updated successfully');
      }

      onOpenChange(false);
      form.reset();
      setDate(undefined);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} holiday`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      // Format as YYYY-MM-DD
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      form.setValue('holidayDate', formattedDate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add SLA Holiday' : 'Edit SLA Holiday'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a non-working day to exclude from SLA business days calculation'
              : 'Update holiday information'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="holidayDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Holiday Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !date && 'text-muted-foreground'
                        )}
                      >
                        {date ? (
                          format(date, 'dd MMMM yyyy', { locale: localeId })
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date('1900-01-01')}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the non-working day (will be excluded from SLA calculations)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Hari Kemerdekaan RI, Tahun Baru Masehi"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Name of the holiday or non-working day</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'edit' && (
              <FormField
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {field.value
                          ? 'Holiday is active and excluded from SLA'
                          : 'Holiday is inactive (will not affect SLA)'}
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
                    ? 'Adding...'
                    : 'Saving...'
                  : mode === 'create'
                    ? 'Add Holiday'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
