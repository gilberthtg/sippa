import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Play,
  PauseCircle,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

const statusIcons: Record<string, LucideIcon> = {
  clock: Clock,
  eye: Eye,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  play: Play,
  'pause-circle': PauseCircle,
  'check-circle-2': CheckCircle2,
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeVariants = {
  sm: 'text-[10px] px-1.5 py-0 [&_svg]:w-2.5 [&_svg]:h-2.5 [&_svg]:mr-0.5',
  md: 'text-xs px-2 py-0.5 [&_svg]:w-3 [&_svg]:h-3 [&_svg]:mr-1',
  lg: 'text-sm px-3 py-1 [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:mr-1.5',
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
    icon: 'clock',
  };

  const Icon = statusIcons[config.icon];

  return (
    <Badge className={cn(config.className, sizeVariants[size], className)}>
      {Icon && <Icon />}
      {config.label}
    </Badge>
  );
}
