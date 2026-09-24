import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Halaman Tidak Ditemukan</h1>
        <p className="max-w-[500px] text-muted-foreground">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
      </div>
      <Link href="/">
        <Button>Kembali ke Dashboard</Button>
      </Link>
    </div>
  );
}
