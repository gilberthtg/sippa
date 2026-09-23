import { Badge } from '@/components/ui/badge';
import { PRIORITY_CODES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityConfig = {
  [PRIORITY_CODES.LOW]: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  },
  [PRIORITY_CODES.MEDIUM]: {
    label: 'Medium',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  [PRIORITY_CODES.HIGH]: {
    label: 'High',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  },
  [PRIORITY_CODES.CRITICAL]: {
    label: 'Critical',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority as keyof typeof priorityConfig] || {
    label: priority,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
