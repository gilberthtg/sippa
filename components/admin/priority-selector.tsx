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
  status?: string;
}

export function PrioritySelector({
  requestId,
  currentPriorityId,
  priorities,
  status,
}: PrioritySelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>(
    currentPriorityId?.toString() || ''
  );

  const isLocked = status?.toLowerCase() === 'ongoing';
  const selectedPriority = priorities.find(p => p.id.toString() === selectedPriorityId);

  const handlePriorityChange = () => {
    if (isLocked || !selectedPriorityId || selectedPriorityId === currentPriorityId?.toString()) {
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
          disabled={isPending || isLocked}
        >
          <SelectTrigger id="priority" className="w-full">
            <SelectValue placeholder="Pilih priority">
              {selectedPriority ? `${selectedPriority.code} - ${selectedPriority.name}` : 'Pilih priority'}
            </SelectValue>
          </SelectTrigger>
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
        {isLocked && (
          <p className="text-xs text-muted-foreground">
            Priority tidak dapat diubah setelah request berjalan (ongoing).
          </p>
        )}
      </div>

      {!isLocked && hasChanged && (
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
