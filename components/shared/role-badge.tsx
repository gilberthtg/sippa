import { getRoleBadgeColor, getRoleName } from '@/lib/utils/role-badge';

interface RoleBadgeProps {
  roleCode: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ roleCode, showIcon = true, size = 'md' }: RoleBadgeProps) {
  const config = getRoleBadgeColor(roleCode);
  const roleName = getRoleName(roleCode);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{roleName}</span>
    </span>
  );
}
