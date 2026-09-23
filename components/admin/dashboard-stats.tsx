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
    verification: number;
    approved: number;
    assigned: number;
    inProgress: number;
    completed: number;
    rejected: number;
    total: number;
  };
}

const statCards = [
  {
    title: 'Butuh Verifikasi',
    key: 'submitted' as const,
    icon: FileText,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    link: '/admin/requests?status=submitted',
  },
  {
    title: 'Dalam Verifikasi',
    key: 'verification' as const,
    icon: ClipboardCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    link: '/admin/requests?status=verification',
  },
  {
    title: 'Disetujui',
    key: 'approved' as const,
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    link: '/admin/requests?status=approved',
  },
  {
    title: 'Ditugaskan',
    key: 'assigned' as const,
    icon: UserCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    link: '/admin/requests?status=assigned',
  },
  {
    title: 'Dalam Proses',
    key: 'inProgress' as const,
    icon: PlayCircle,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    link: '/admin/requests?status=in_progress',
  },
  {
    title: 'Selesai',
    key: 'completed' as const,
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    link: '/admin/requests?status=completed',
  },
  {
    title: 'Ditolak',
    key: 'rejected' as const,
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    link: '/admin/requests?status=rejected',
  },
  {
    title: 'Total Request',
    key: 'total' as const,
    icon: Clock,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    link: '/admin/requests',
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
                  {card.key === 'total' ? 'Semua request' : 'Klik untuk lihat detail'}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
