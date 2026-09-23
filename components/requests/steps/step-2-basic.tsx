'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { URGENCY_LEVELS } from '@/lib/constants';

interface Step2BasicProps {
  title: string;
  description: string;
  urgency: string;
  requesterPhone: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onUrgencyChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  errors?: {
    title?: string;
    description?: string;
  };
}

export function Step2Basic({
  title,
  description,
  urgency,
  requesterPhone,
  onTitleChange,
  onDescriptionChange,
  onUrgencyChange,
  onPhoneChange,
  errors,
}: Step2BasicProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Informasi Dasar</h3>
        <p className="text-sm text-muted-foreground">
          Berikan informasi dasar tentang permintaan Anda
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Judul Permintaan <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Contoh: Aplikasi Monitoring Inventaris"
            maxLength={200}
          />
          {errors?.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {title.length}/200 karakter (minimal 10)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Deskripsi <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Jelaskan secara detail tentang permintaan Anda..."
            rows={6}
            maxLength={5000}
          />
          {errors?.description && (
            <p className="text-xs text-destructive">{errors.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {description.length}/5000 karakter (minimal 50)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="urgency">Tingkat Urgensi</Label>
          <Select value={urgency} onValueChange={(value) => onUrgencyChange(value || '')}>
            <SelectTrigger id="urgency">
              <SelectValue placeholder="Pilih tingkat urgensi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={URGENCY_LEVELS.LOW}>Rendah</SelectItem>
              <SelectItem value={URGENCY_LEVELS.MEDIUM}>Sedang</SelectItem>
              <SelectItem value={URGENCY_LEVELS.HIGH}>Tinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requesterPhone">Nomor Telepon</Label>
          <Input
            id="requesterPhone"
            type="tel"
            value={requesterPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="Contoh: 081234567890"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">
            Opsional - untuk kemudahan komunikasi
          </p>
        </div>
      </div>
    </div>
  );
}
