import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RoleBadge } from '@/components/shared/role-badge';
import { Badge } from '@/components/ui/badge';

interface DeveloperRoleSLAMetric {
  roleCode: string;
  roleName: string;
  totalRequests: number;
  slaMet: number;
  slaExceeded: number;
  achievementRate: number;
  avgCompletionTime: number;
}

interface DeveloperRoleSLAMetricsProps {
  metrics: DeveloperRoleSLAMetric[];
}

export function DeveloperRoleSLAMetrics({ metrics }: DeveloperRoleSLAMetricsProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pencapaian SLA per Developer Role</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tidak ada data SLA developer role untuk periode ini.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by achievement rate descending
  const sortedMetrics = [...metrics].sort((a, b) => b.achievementRate - a.achievementRate);

  const formatHours = (hours: number) => {
    if (hours === 0) return '-';
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (days > 0) {
      return `${days} hari ${remainingHours} jam`;
    }
    return `${remainingHours} jam`;
  };

  const getAchievementBadge = (rate: number) => {
    if (rate >= 90) {
      return <Badge variant="default" className="bg-green-500">Excellent</Badge>;
    } else if (rate >= 75) {
      return <Badge variant="default" className="bg-blue-500">Good</Badge>;
    } else if (rate >= 60) {
      return <Badge variant="default" className="bg-yellow-500">Fair</Badge>;
    } else {
      return <Badge variant="destructive">Needs Improvement</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pencapaian SLA per Developer Role</CardTitle>
        <p className="text-sm text-muted-foreground">
          Performa SLA berdasarkan peran developer yang terlibat
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">SLA Met</TableHead>
              <TableHead className="text-right">SLA Exceeded</TableHead>
              <TableHead className="text-right">Achievement Rate</TableHead>
              <TableHead className="text-right">Rata-rata Waktu</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMetrics.map((metric) => (
              <TableRow key={metric.roleCode}>
                <TableCell>
                  <RoleBadge roleCode={metric.roleCode} size="sm" />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {metric.totalRequests}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {metric.slaMet}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {metric.slaExceeded}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {metric.achievementRate.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatHours(metric.avgCompletionTime)}
                </TableCell>
                <TableCell>
                  {getAchievementBadge(metric.achievementRate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          <p>
            <strong>Catatan:</strong> Satu request dapat melibatkan beberapa developer role.
            Metrik di atas menghitung semua keterlibatan role dalam request.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">Excellent</Badge>
              <span>≥ 90%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-blue-500">Good</Badge>
              <span>75-89%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-yellow-500">Fair</Badge>
              <span>60-74%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Needs Improvement</Badge>
              <span>&lt; 60%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
