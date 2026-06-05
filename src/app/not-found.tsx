'use client';

import Link from 'next/link';
import { Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-extrabold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-extrabold mb-2">Página no encontrada</h1>
        <p className="text-muted-foreground text-sm mb-6">
          La página que buscas no existe o fue movida. Puedes explorar instituciones o volver al inicio.
        </p>
        <div className="flex gap-3 flex-col sm:flex-row">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/explore" className="flex items-center gap-2 justify-center">
              <Search className="w-4 h-4" />
              Explorar
            </Link>
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
            <Link href="/" className="flex items-center gap-2 justify-center">
              <Home className="w-4 h-4" />
              Inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
