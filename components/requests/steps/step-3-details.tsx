'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Step3DetailsProps {
  businessNeed: string;
  objective: string;
  expectedOutput: string;
  onBusinessNeedChange: (value: string) => void;
  onObjectiveChange: (value: string) => void;
  onExpectedOutputChange: (value: string) => void;
}

export function Step3Details({
  businessNeed,
  objective,
  expectedOutput,
  onBusinessNeedChange,
  onObjectiveChange,
  onExpectedOutputChange,
}: Step3DetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Detail Kebutuhan</h3>
        <p className="text-sm text-muted-foreground">
          Informasi detail untuk membantu kami memahami kebutuhan Anda dengan lebih baik (opsional)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessNeed">Kebutuhan Bisnis</Label>
          <Textarea
            id="businessNeed"
            value={businessNeed}
            onChange={(e) => onBusinessNeedChange(e.target.value)}
            placeholder="Jelaskan latar belakang dan alasan bisnis di balik permintaan ini..."
            rows={4}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">
            {businessNeed.length}/2000 karakter
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="objective">Tujuan</Label>
          <Textarea
            id="objective"
            value={objective}
            onChange={(e) => onObjectiveChange(e.target.value)}
            placeholder="Apa tujuan yang ingin dicapai dengan aplikasi/perubahan ini..."
            rows={4}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">
            {objective.length}/2000 karakter
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedOutput">Output yang Diharapkan</Label>
          <Textarea
            id="expectedOutput"
            value={expectedOutput}
            onChange={(e) => onExpectedOutputChange(e.target.value)}
            placeholder="Jelaskan output atau hasil akhir yang Anda harapkan..."
            rows={4}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">
            {expectedOutput.length}/2000 karakter
          </p>
        </div>
      </div>
    </div>
  );
}
