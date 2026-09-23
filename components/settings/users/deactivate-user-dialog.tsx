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
import { toggleUserActive } from '@/app/actions/user-management';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

type User = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  currentUserId: number;
};

export function DeactivateUserDialog({ open, onOpenChange, user, currentUserId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isCurrentUser = user.id === currentUserId;

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      await toggleUserActive(user.id, !user.isActive);
      toast.success(
        user.isActive
          ? 'User deactivated successfully'
          : 'User activated successfully'
      );
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user status');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCurrentUser) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cannot Deactivate</DialogTitle>
            <DialogDescription>
              You cannot deactivate your own account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user.isActive && <AlertTriangle className="h-5 w-5 text-destructive" />}
            {user.isActive ? 'Deactivate User' : 'Activate User'}
          </DialogTitle>
          <DialogDescription>
            {user.isActive ? (
              <>
                Are you sure you want to deactivate <span className="font-medium">{user.name}</span>?
                <br />
                They will not be able to access the system until reactivated.
              </>
            ) : (
              <>
                Are you sure you want to activate <span className="font-medium">{user.name}</span>?
                <br />
                They will be able to access the system again.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={user.isActive ? 'destructive' : 'default'}
            onClick={handleToggle}
            disabled={isLoading}
          >
            {isLoading
              ? user.isActive
                ? 'Deactivating...'
                : 'Activating...'
              : user.isActive
              ? 'Deactivate'
              : 'Activate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
