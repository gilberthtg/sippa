'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Code, FileCode, TestTube, Database, FileText, Laptop } from 'lucide-react';

interface DeveloperRoleDistributionProps {
  distribution: Array<{
    roleId: number;
    roleCode: string;
    roleName: string;
    activeRequests: number;
  }>;
}

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  SA: Laptop,
  TW: FileText,
  BE: Code,
  FE: FileCode,
  QA: TestTube,
  DM: Database,
};

const roleColors: Record<string, { bg: string; text: string; badge: string }> = {
  SA: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
  TW: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  BE: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  FE: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  QA: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
  DM: { bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
};

export function DeveloperRoleDistributionWidget({ distribution }: DeveloperRoleDistributionProps) {
  const totalActiveRequests = distribution.reduce((sum, role) => sum + Number(role.activeRequests), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Distribusi Role Developer
        </CardTitle>
        <CardDescription>
          Request aktif (Assigned & In Progress) per role developer
        </CardDescription>
      </CardHeader>
      <CardContent>
        {distribution.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Belum ada assignment developer</p>
          </div>
        ) : (
          <div className="space-y-6">
            {distribution.map((role) => {
              const Icon = roleIcons[role.roleCode] || Users;
              const colors = roleColors[role.roleCode] || roleColors.SA;
              const activeCount = Number(role.activeRequests);
              const percentage = totalActiveRequests > 0 
                ? Math.round((activeCount / totalActiveRequests) * 100) 
                : 0;

              return (
                <div key={role.roleId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <Icon className={`h-4 w-4 ${colors.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{role.roleName}</p>
                          <Badge variant="secondary" className={`text-xs ${colors.badge}`}>
                            {role.roleCode}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activeCount} request aktif
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{activeCount}</p>
                      {/* {totalActiveRequests > 0 && (
                        <p className="text-xs text-muted-foreground">{percentage}%</p>
                      )} */}
                    </div>
                  </div>
                  {/* Progress bar */}
                  {/* {totalActiveRequests > 0 && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${colors.bg}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )} */}
                </div>
              );
            })}

            {/* {totalActiveRequests > 0 && (
              <div className="pt-3 mt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Total Request Aktif</span>
                  <span className="font-bold text-lg">{totalActiveRequests}</span>
                </div>
              </div>
            )} */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
