'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { TopNav } from './top-nav';
import type { Role } from '@/lib/constants';

interface AppShellProps {
  user: {
    id?: number;
    name?: string | null;
    email?: string | null;
    roleCode?: string;
  };
  role: Role;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  children: React.ReactNode;
}

export function AppShell({ user, role, breadcrumbs, children }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar role={role} />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        role={role}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav
          user={user}
          onMenuClick={() => setIsMobileNavOpen(true)}
          breadcrumbs={breadcrumbs}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
