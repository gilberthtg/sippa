import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  ClipboardList, 
  BarChart3, 
  Target,
  Settings,
  type LucideIcon 
} from 'lucide-react';
import type { Role } from '@/lib/constants';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['user'],
      },
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        roles: ['admin'],
      },
      {
        label: 'Dashboard',
        href: '/developer/dashboard',
        icon: LayoutDashboard,
        roles: ['developer'],
      },
    ],
  },
  {
    title: 'Requests',
    items: [
      {
        label: 'Request Baru',
        href: '/requests/new',
        icon: Plus,
        roles: ['user'],
      },
      {
        label: 'DevTI Request',
        href: '/requests',
        icon: FileText,
        roles: ['user'],
      },
      {
        label: 'DevTI Request',
        href: '/admin/requests',
        icon: FileText,
        roles: ['admin'],
      },
      // {
      //   label: 'My Assignment',
      //   href: '/developer/assignments',
      //   icon: ClipboardList,
      //   roles: ['developer'],
      // },
      {
        label: 'DevTI Request',
        href: '/developer/requests',
        icon: FileText,
        roles: ['developer'],
      },
    ],
  },
  {
    title: 'Reports',
    items: [
      {
        label: 'Laptri',
        href: '/admin/reports/laptri',
        icon: BarChart3,
        roles: ['admin'],
      },
      {
        label: 'Pencapaian SLA',
        href: '/admin/reports/sla',
        icon: Target,
        roles: ['admin'],
      },
    ],
  },
  // {
  //   title: 'Administration',
  //   items: [
  //     {
  //       label: 'Settings',
  //       href: '/admin/settings',
  //       icon: Settings,
  //       roles: ['admin'],
  //     },
  //   ],
  // },
];

export function getNavigationForRole(role: Role): NavSection[] {
  return navigationConfig
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}
