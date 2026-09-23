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
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { completeRequest } from '@/app/actions/developer-requests';
import { Loader2, AlertTriangle } from 'lucide-react';

const completeSchema = z.object({
  finalNote: z.string().min(20, 'Final note minimal 20 karakter'),
});

type CompleteFormData = z.infer<typeof completeSchema>;

interface CompleteRequestDialogProps {
  requestId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompleteRequestDialog({
  requestId,
  open,
  onOpenChange,
}: CompleteRequestDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompleteFormData>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      finalNote: '',
    },
  });

  const onSubmit = async (data: CompleteFormData) => {
    setIsSubmitting(true);

    try {
      const result = await completeRequest({
        requestId,
        finalNote: data.finalNote,
      });

      if (result.success) {
        toast.success('Request berhasil diselesaikan');
        onOpenChange(false);
        reset();
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal menyelesaikan request');
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
          <DialogTitle>Mark as Complete</DialogTitle>
          <DialogDescription>
            Tandai request ini sebagai selesai. Status akan berubah menjadi COMPLETED.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Pastikan semua pekerjaan telah selesai sebelum melanjutkan. Aksi ini tidak dapat dibatalkan.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="finalNote">
                Final Note <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="finalNote"
                {...register('finalNote')}
                placeholder="Jelaskan hasil akhir dan ringkasan pekerjaan (minimal 20 karakter)"
                rows={6}
              />
              {errors.finalNote && (
                <p className="text-sm text-red-600">{errors.finalNote.message}</p>
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
              Complete Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
