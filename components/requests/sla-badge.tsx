import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SLAStatusBadgeProps {
  status: 'on_track' | 'at_risk' | 'breached' | 'met' | 'missed';
  className?: string;
}

const slaConfig = {
  on_track: {
    label: 'On Track',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  at_risk: {
    label: 'At Risk',
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  },
  breached: {
    label: 'Breached',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  met: {
    label: 'Met',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  missed: {
    label: 'Missed',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
};

export function SLAStatusBadge({ status, className }: SLAStatusBadgeProps) {
  const config = slaConfig[status];

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
