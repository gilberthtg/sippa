import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Flag, UsersRound, Target } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { users, units, priorities, teams, slaPolicies } from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';

async function getSettingsStats() {
  const [
    totalUsers,
    activeUsers,
    totalUnits,
    totalPriorities,
    totalTeams,
    activeSLAPolicies,
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(users).where(eq(users.isActive, true)),
    db.select({ count: count() }).from(units),
    db.select({ count: count() }).from(priorities),
    db.select({ count: count() }).from(teams),
    db.select({ count: count() }).from(slaPolicies).where(eq(slaPolicies.isActive, true)),
  ]);

  return {
    totalUsers: totalUsers[0].count,
    activeUsers: activeUsers[0].count,
    totalUnits: totalUnits[0].count,
    totalPriorities: totalPriorities[0].count,
    totalTeams: totalTeams[0].count,
    activeSLAPolicies: activeSLAPolicies[0].count,
  };
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.roleCode !== 'admin') {
    redirect('/login');
  }

  const stats = await getSettingsStats();

  const settingsCards = [
    {
      title: 'User Management',
      description: 'Manage system users, roles, and permissions',
      icon: Users,
      href: '/admin/settings/users',
      stats: [
        { label: 'Total Users', value: stats.totalUsers },
        { label: 'Active Users', value: stats.activeUsers },
      ],
    },
    {
      title: 'Units',
      description: 'Manage organizational units',
      icon: Building2,
      href: '/admin/settings/units',
      stats: [{ label: 'Total Units', value: stats.totalUnits }],
    },
    {
      title: 'Priorities',
      description: 'Manage request priority levels',
      icon: Flag,
      href: '/admin/settings/priorities',
      stats: [{ label: 'Priority Levels', value: stats.totalPriorities }],
    },
    {
      title: 'Teams',
      description: 'Manage development teams',
      icon: UsersRound,
      href: '/admin/settings/teams',
      stats: [{ label: 'Total Teams', value: stats.totalTeams }],
    },
    {
      title: 'SLA Policies',
      description: 'Manage service level agreements',
      icon: Target,
      href: '/admin/settings/sla-policies',
      stats: [{ label: 'Active Policies', value: stats.activeSLAPolicies }],
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage system configuration, users, and master data"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {card.stats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <span className="text-lg font-semibold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
