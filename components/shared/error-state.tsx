import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Error',
  message,
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('py-12 px-4', className)}>
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
          {retry && (
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="mt-4"
            >
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
