'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Loader2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import Header from '@/components/layout/header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { Institution, Program, Category } from '@/lib/database.types';

export default function ProgramsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [programs, setPrograms] = useState<(Program & { categories: Category | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: inst } = await supabase
        .from('institutions')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      setInstitution(inst);

      if (inst) {
        const { data: progs } = await supabase
          .from('programs')
          .select('*, categories(*)')
          .eq('institution_id', inst.id)
          .order('created_at', { ascending: false });
        setPrograms((progs ?? []) as any);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const toggleActive = async (program: Program) => {
    const { error } = await supabase
      .from('programs')
      .update({ is_active: !program.is_active })
      .eq('id', program.id);
    if (error) { toast.error('Error al actualizar'); return; }
    setPrograms((prev) => prev.map((p) => p.id === program.id ? { ...p, is_active: !p.is_active } : p));
    toast.success(program.is_active ? 'Programa desactivado' : 'Programa activado');
  };

  const deleteProgram = async (id: string) => {
    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) { toast.error('Error al eliminar'); return; }
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    toast.success('Programa eliminado');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Programas</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona las actividades de {institution?.name}
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" asChild>
            <Link href="/dashboard/programs/new">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo programa
            </Link>
          </Button>
        </div>

        {!institution && (
          <div className="text-center py-16 text-muted-foreground">
            <p>Primero debes crear tu institución.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/settings">Crear institución</Link>
            </Button>
          </div>
        )}

        {institution && programs.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted-foreground bg-card">
            <div className="w-14 h-14 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Sin programas</h3>
            <p className="text-sm mb-4">Agrega tu primer programa o actividad.</p>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link href="/dashboard/programs/new">Crear programa</Link>
            </Button>
          </div>
        )}

        {programs.length > 0 && (
          <div className="space-y-3">
            {programs.map((program) => (
              <div key={program.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-sm">{program.name}</h3>
                    {program.categories && (
                      <Badge variant="secondary" className="text-xs">{(program as any).categories?.name}</Badge>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${program.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                      {program.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{program.description || 'Sin descripción'}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{program.age_min}–{program.age_max} años</span>
                    <span className="capitalize">{program.modality}</span>
                    <span className="capitalize">{program.gender}</span>
                    {program.schedule && <span>• {program.schedule}</span>}
                    {program.price > 0 && <span>• ${Number(program.price).toLocaleString('es-CO')} COP</span>}
                    {program.price === 0 && <span className="text-emerald-600 font-medium">• Gratuito</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(program)}
                    className="h-8 w-8 p-0"
                    title={program.is_active ? 'Desactivar' : 'Activar'}
                  >
                    {program.is_active
                      ? <PowerOff className="w-4 h-4 text-amber-600" />
                      : <Power className="w-4 h-4 text-emerald-600" />
                    }
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                    <Link href={`/dashboard/programs/${program.id}/edit`}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar programa</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. El programa "{program.name}" será eliminado permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProgram(program.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
