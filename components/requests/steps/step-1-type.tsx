'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { REQUEST_TYPES } from '@/lib/constants';

interface Step1TypeProps {
  value: string;
  onChange: (value: string) => void;
}

export function Step1Type({ value, onChange }: Step1TypeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Pilih Jenis Permintaan</h3>
        <p className="text-sm text-muted-foreground">
          Tentukan jenis permintaan pengembangan aplikasi yang Anda butuhkan
        </p>
      </div>

      <RadioGroup value={value} onValueChange={onChange}>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <RadioGroupItem value={REQUEST_TYPES.NEW_APPLICATION} id="new_application" />
            <div className="flex-1">
              <Label
                htmlFor="new_application"
                className="text-base font-medium cursor-pointer"
              >
                New Application
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Permintaan pembuatan aplikasi baru yang belum pernah ada sebelumnya
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <RadioGroupItem value={REQUEST_TYPES.RFC} id="rfc" />
            <div className="flex-1">
              <Label htmlFor="rfc" className="text-base font-medium cursor-pointer">
                RFC (Request for Change)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Permintaan perubahan, perbaikan, atau penambahan fitur pada aplikasi yang sudah ada
              </p>
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
