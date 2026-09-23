'use client';

import { useState, useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { setPriority } from '@/app/actions/admin-requests';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PrioritySelectorProps {
  requestId: number;
  currentPriorityId: number | null;
  priorities: Array<{ id: number; code: string; name: string }>;
}

export function PrioritySelector({
  requestId,
  currentPriorityId,
  priorities,
}: PrioritySelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>(
    currentPriorityId?.toString() || ''
  );

  const handlePriorityChange = () => {
    if (!selectedPriorityId || selectedPriorityId === currentPriorityId?.toString()) {
      return;
    }

    startTransition(async () => {
      const result = await setPriority(requestId, parseInt(selectedPriorityId));
      
      if (result.success) {
        toast.success('Priority berhasil diubah');
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal mengubah priority');
        setSelectedPriorityId(currentPriorityId?.toString() || '');
      }
    });
  };

  const hasChanged = selectedPriorityId !== currentPriorityId?.toString();

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={selectedPriorityId}
          onValueChange={(val) => setSelectedPriorityId(val || '')}
          disabled={isPending}
        >
          <SelectTrigger id="priority">
            <SelectValue placeholder="Pilih priority" />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((priority) => (
              <SelectItem key={priority.id} value={priority.id.toString()}>
                {priority.code} - {priority.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasChanged && (
        <Button
          onClick={handlePriorityChange}
          disabled={isPending}
          size="sm"
          className="w-full"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Priority
        </Button>
      )}
    </div>
  );
}
