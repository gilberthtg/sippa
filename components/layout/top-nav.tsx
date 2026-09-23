'use client';

import { Menu, Bell } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from './user-menu';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface TopNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    roleCode?: string;
  };
  onMenuClick: () => void;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function TopNav({ user, onMenuClick, breadcrumbs }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-bold text-primary">
        <span className="text-xl">SiPPA</span>
      </Link>

      {/* Breadcrumbs - hidden on mobile */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={index}>
                {index < breadcrumbs.length - 1 ? (
                  <>
                    <BreadcrumbLink href={crumb.href || '#'}>
                      {crumb.label}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification bell - placeholder */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
      </Button>

      {/* User menu */}
      <UserMenu user={user} />
    </header>
  );
}
