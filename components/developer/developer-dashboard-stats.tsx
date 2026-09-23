'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface DashboardStatsProps {
  stats: {
    assigned: number;
    inProgress: number;
    completedThisMonth: number;
    overdue: number;
  };
}

export function DeveloperDashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Assigned',
      value: stats.assigned,
      icon: ClipboardList,
      description: 'Request yang di-assign',
      href: '/developer/assignments?status=assigned',
      color: 'text-blue-600',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      description: 'Sedang dikerjakan',
      href: '/developer/assignments?status=in_progress',
      color: 'text-primary',
    },
    {
      title: 'Completed This Month',
      value: stats.completedThisMonth,
      icon: CheckCircle2,
      description: 'Selesai bulan ini',
      href: '/developer/assignments?status=completed',
      color: 'text-green-600',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      description: 'Melewati target SLA',
      href: '/developer/assignments',
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
