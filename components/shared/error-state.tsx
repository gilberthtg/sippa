import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, FileQuestion, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

interface ErrorStateProps {
  type?: '404' | '500' | 'error';
  title?: string;
  message?: string;
  showReset?: boolean;
  onReset?: () => void;
  backUrl?: string;
  backLabel?: string;
}

export function ErrorState({
  type = 'error',
  title,
  message,
  showReset = false,
  onReset,
  backUrl = '/',
  backLabel = 'Kembali ke Dashboard',
}: ErrorStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case '404':
        return {
          icon: FileQuestion,
          title: title || 'Halaman Tidak Ditemukan',
          message: message || 'Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.',
          iconBg: 'bg-muted',
          iconColor: 'text-muted-foreground',
        };
      case '500':
        return {
          icon: AlertCircle,
          title: title || 'Terjadi Kesalahan Server',
          message: message || 'Maaf, terjadi kesalahan pada server. Tim kami sudah diberitahu dan sedang memperbaikinya.',
          iconBg: 'bg-destructive/10',
          iconColor: 'text-destructive',
        };
      default:
        return {
          icon: AlertCircle,
          title: title || 'Terjadi Kesalahan',
          message: message || 'Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi atau kembali ke halaman utama.',
          iconBg: 'bg-destructive/10',
          iconColor: 'text-destructive',
        };
    }
  };

  const content = getDefaultContent();
  const Icon = content.icon;

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 p-8">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Icon */}
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${content.iconBg}`}>
            <Icon className={`h-10 w-10 ${content.iconColor}`} />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {content.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-3 pt-2">
            {showReset && onReset && (
              <Button 
                onClick={onReset} 
                className="w-full gap-2"
                size="lg"
              >
                <RefreshCcw className="h-4 w-4" />
                Coba Lagi
              </Button>
            )}
            <Link href={backUrl} className="w-full">
              <Button 
                variant={showReset ? "outline" : "default"} 
                className="w-full gap-2"
                size="lg"
              >
                <Home className="h-4 w-4" />
                {backLabel}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
