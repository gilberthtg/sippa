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
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface DeveloperRoleMetric {
  roleCode: string;
  roleName: string;
  count: number;
  avgCompletionTime: number;
  latestCompletedAt: Date | null;
}

interface DeveloperRoleMetricsProps {
  metrics: DeveloperRoleMetric[];
}

export function DeveloperRoleMetrics({ metrics }: DeveloperRoleMetricsProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Keterlibatan Developer Role</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tidak ada data developer role untuk periode ini.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by count descending
  const sortedMetrics = [...metrics].sort((a, b) => b.count - a.count);

  const formatHours = (hours: number) => {
    if (hours === 0) return '-';
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (days > 0) {
      return `${days} hari ${remainingHours} jam`;
    }
    return `${remainingHours} jam`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keterlibatan Developer Role</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribusi peran developer dalam request yang diselesaikan
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Jumlah Request</TableHead>
              <TableHead className="text-right">Rata-rata Waktu</TableHead>
              <TableHead>Request Terakhir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMetrics.map((metric) => (
              <TableRow key={metric.roleCode}>
                <TableCell>
                  <RoleBadge roleCode={metric.roleCode} size="sm" />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {metric.count}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatHours(metric.avgCompletionTime)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {metric.latestCompletedAt
                    ? formatDistanceToNow(metric.latestCompletedAt, {
                        addSuffix: true,
                        locale: localeId,
                      })
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            <strong>Catatan:</strong> Satu request dapat melibatkan beberapa developer role.
            Jumlah di atas menunjukkan total keterlibatan role dalam semua request yang diselesaikan.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
