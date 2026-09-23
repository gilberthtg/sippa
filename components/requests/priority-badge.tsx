import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priorityId: number;
  className?: string;
}

const priorityConfig: Record<number, { label: string; className: string }> = {
  1: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  },
  2: {
    label: 'Medium',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  3: {
    label: 'High',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  },
  4: {
    label: 'Critical',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
};

export function PriorityBadge({ priorityId, className }: PriorityBadgeProps) {
  const config = priorityConfig[priorityId] || {
    label: 'Unknown',
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
