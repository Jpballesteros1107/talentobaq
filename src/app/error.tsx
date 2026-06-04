'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">Algo salió mal</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Ocurrió un error inesperado. Intenta recargar la página o vuelve al inicio.
        </p>
        <div className="flex gap-3 flex-col sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={reset}>
            Reintentar
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
            <Link href="/" className="flex items-center gap-2 justify-center">
              <Home className="w-4 h-4" />
              Ir al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
