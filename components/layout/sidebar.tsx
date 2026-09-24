'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getNavigationForRole } from '@/lib/config/navigation';
import type { Role } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navigation = getNavigationForRole(role);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r lg:bg-white">
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {section.title && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                // More precise active state logic:
                // 1. Exact match OR
                // 2. Pathname starts with href + '/' (but href must not be a prefix of another href in the same section)
                const isExactMatch = pathname === item.href;
                const isChildRoute = pathname.startsWith(item.href + '/');
                
                // Check if current item.href is a prefix of any other item in this section
                const hasMoreSpecificRoute = section.items.some(
                  (otherItem) => otherItem.href !== item.href && otherItem.href.startsWith(item.href)
                );
                
                // Only consider child route active if there's no more specific route
                const isActive = isExactMatch || (isChildRoute && !hasMoreSpecificRoute);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {sectionIdx < navigation.length - 1 && (
              <Separator className="my-3" />
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
