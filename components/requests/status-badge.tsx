import { Badge } from '@/components/ui/badge';
import { REQUEST_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig = {
  [REQUEST_STATUSES.SUBMITTED]: {
    label: 'Submitted',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  [REQUEST_STATUSES.IN_REVIEW]: {
    label: 'In Review',
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  },
  [REQUEST_STATUSES.REJECTED]: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  [REQUEST_STATUSES.APPROVED]: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  [REQUEST_STATUSES.ONGOING]: {
    label: 'Ongoing',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  [REQUEST_STATUSES.ON_HOLD]: {
    label: 'On Hold',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  },
  [REQUEST_STATUSES.DONE]: {
    label: 'Done',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}