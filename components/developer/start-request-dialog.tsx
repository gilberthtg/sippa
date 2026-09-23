'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';
import { startRequest } from '@/app/actions/developer-requests';
import { Loader2 } from 'lucide-react';

interface StartRequestDialogProps {
  requestId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartRequestDialog({
  requestId,
  open,
  onOpenChange,
}: StartRequestDialogProps) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await startRequest({ requestId, note: note || undefined });

      if (result.success) {
        toast.success('Request berhasil dimulai');
        onOpenChange(false);
        setNote('');
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal memulai request');
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
          <DialogTitle>Start Work</DialogTitle>
          <DialogDescription>
            Mulai mengerjakan request ini. Status akan berubah menjadi IN PROGRESS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Tambahkan catatan awal..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Start Work
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
