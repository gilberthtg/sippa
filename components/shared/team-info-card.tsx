import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleBadge } from './role-badge';
import { Users, UserCheck, FileText } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  developerRoleCode: string | null;
  developerRoleName: string | null;
  isCurrentUser?: boolean;
}

interface TeamLeader {
  id: number;
  name: string;
  email: string;
}

interface TechnicalWriter {
  id: number;
  name: string;
  email: string;
  developerRoleCode: string | null;
  developerRoleName: string | null;
}

interface TeamInfoCardProps {
  devtiUrusan?: string | null;
  teamLeader?: TeamLeader | null;
  technicalWriter?: TechnicalWriter | null;
  teamMembers?: TeamMember[];
  currentUserId?: number;
}

export function TeamInfoCard({
  devtiUrusan,
  teamLeader,
  technicalWriter,
  teamMembers = [],
  currentUserId,
}: TeamInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* DevTI Urusan */}
        {devtiUrusan && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              DevTI Urusan
            </p>
            <p className="text-sm">{devtiUrusan}</p>
          </div>
        )}

        {/* Team Leader */}
        {teamLeader && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <UserCheck className="h-4 w-4" />
              Team Leader
            </p>
            <div className="pl-5 space-y-1">
              <p className="text-sm font-medium">{teamLeader.name}</p>
              <p className="text-xs text-muted-foreground">{teamLeader.email}</p>
            </div>
          </div>
        )}

        {/* Technical Writer */}
        {technicalWriter && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Technical Writer
            </p>
            <div className="pl-5 space-y-2">
              <p className="text-sm font-medium">{technicalWriter.name}</p>
              <p className="text-xs text-muted-foreground">{technicalWriter.email}</p>
              {technicalWriter.developerRoleCode && (
                <RoleBadge roleCode={technicalWriter.developerRoleCode} size="sm" />
              )}
            </div>
          </div>
        )}

        {/* Team Members / Developers */}
        {teamMembers.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Users className="h-4 w-4" />
              Team Members ({teamMembers.length})
            </p>
            <div className="space-y-3 pl-5">
              {teamMembers.map((member) => {
                const isYou = currentUserId ? member.id === currentUserId : member.isCurrentUser;
                return (
                  <div
                    key={member.id}
                    className={`space-y-2 pb-3 border-b last:border-b-0 ${
                      isYou ? 'bg-primary/5 -ml-5 pl-5 pr-2 py-2 rounded' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.name}
                          {isYou && (
                            <span className="ml-2 text-xs text-primary font-semibold">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>
                      {member.developerRoleCode && (
                        <RoleBadge roleCode={member.developerRoleCode} size="sm" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!devtiUrusan && !teamLeader && !technicalWriter && teamMembers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Tim belum di-assign untuk request ini
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
