'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateProgress } from '@/app/actions/developer-requests';
import { Loader2 } from 'lucide-react';

const progressSchema = z.object({
  progressPercent: z
    .number()
    .min(0, 'Progress minimal 0%')
    .max(100, 'Progress maksimal 100%'),
  note: z.string().min(10, 'Note minimal 10 karakter'),
});

type ProgressFormData = z.infer<typeof progressSchema>;

interface UpdateProgressDialogProps {
  requestId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateProgressDialog({
  requestId,
  open,
  onOpenChange,
}: UpdateProgressDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      progressPercent: 0,
      note: '',
    },
  });

  const onSubmit = async (data: ProgressFormData) => {
    setIsSubmitting(true);

    try {
      const result = await updateProgress({
        requestId,
        progressPercent: data.progressPercent,
        note: data.note,
      });

      if (result.success) {
        toast.success('Progress berhasil diupdate');
        onOpenChange(false);
        reset();
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal mengupdate progress');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>
            Update progress pengerjaan request ini
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="progressPercent">
                Progress Percentage (0-100) <span className="text-red-600">*</span>
              </Label>
              <Input
                id="progressPercent"
                type="number"
                min="0"
                max="100"
                {...register('progressPercent', { valueAsNumber: true })}
                placeholder="Masukkan persentase (contoh: 50)"
              />
              {errors.progressPercent && (
                <p className="text-sm text-red-600">{errors.progressPercent.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">
                Progress Note <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="note"
                {...register('note')}
                placeholder="Jelaskan progress yang telah dicapai (minimal 10 karakter)"
                rows={4}
              />
              {errors.note && (
                <p className="text-sm text-red-600">{errors.note.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Progress
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
