'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  ClipboardCheck, 
  CheckCircle, 
  UserCheck, 
  PlayCircle, 
  XCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStatsProps {
  stats: {
    submitted: number;
    inReview: number;
    approved: number;
    ongoing: number;
    onHold: number;
    done: number;
    rejected: number;
    total: number;
    approvedNotAssigned: number;
  };
}

const statCards = [
  {
    title: 'Submitted',
    key: 'submitted' as const,
    icon: FileText,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    link: '/admin/requests?status=submitted',
  },
  {
    title: 'In Review',
    key: 'inReview' as const,
    icon: ClipboardCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    link: '/admin/requests?status=in_review',
  },
  {
    title: 'Approved',
    key: 'approved' as const,
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    link: '/admin/requests?status=approved',
  },
  {
    title: 'Ongoing',
    key: 'ongoing' as const,
    icon: PlayCircle,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    link: '/admin/requests?status=ongoing',
  },
  {
    title: 'On Hold',
    key: 'onHold' as const,
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    link: '/admin/requests?status=on_hold',
  },
  {
    title: 'Done',
    key: 'done' as const,
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    link: '/admin/requests?status=done',
  },
  {
    title: 'Rejected',
    key: 'rejected' as const,
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    link: '/admin/requests?status=rejected',
  },
];

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];
        
        return (
          <Link key={card.key} href={card.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Klik untuk lihat detail
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
