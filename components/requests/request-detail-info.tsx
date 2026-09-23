'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { URGENCY_LEVELS } from '@/lib/constants';

interface RequestDetailInfoProps {
  description: string;
  businessNeed: string | null;
  objective: string | null;
  expectedOutput: string | null;
  urgency: string | null;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
}

export function RequestDetailInfo({
  description,
  businessNeed,
  objective,
  expectedOutput,
  urgency,
  requesterName,
  requesterEmail,
  requesterPhone,
}: RequestDetailInfoProps) {
  const getUrgencyLabel = (level: string | null) => {
    if (!level) return '-';
    if (level === URGENCY_LEVELS.LOW) return 'Rendah';
    if (level === URGENCY_LEVELS.MEDIUM) return 'Sedang';
    if (level === URGENCY_LEVELS.HIGH) return 'Tinggi';
    return level;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Deskripsi</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{description}</p>
        </div>

        {urgency && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Tingkat Urgensi</p>
              <Badge variant="secondary">{getUrgencyLabel(urgency)}</Badge>
            </div>
          </>
        )}

        {businessNeed && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-1">Kebutuhan Bisnis</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{businessNeed}</p>
            </div>
          </>
        )}

        {objective && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-1">Tujuan</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{objective}</p>
            </div>
          </>
        )}

        {expectedOutput && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-1">Output yang Diharapkan</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{expectedOutput}</p>
            </div>
          </>
        )}

        <Separator />

        <div>
          <p className="text-sm font-medium mb-2">Informasi Pemohon</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><span className="font-medium">Nama:</span> {requesterName}</p>
            <p><span className="font-medium">Email:</span> {requesterEmail}</p>
            {requesterPhone && (
              <p><span className="font-medium">Telepon:</span> {requesterPhone}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
