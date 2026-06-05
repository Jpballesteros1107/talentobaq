'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, Plus, Eye, CheckCircle2, Clock, AlertCircle,
  LayoutDashboard, BookOpen, Settings, ChevronRight, ArrowRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import type { Institution, Program } from '@/lib/database.types';

const STATUS_CONFIG = {
  pending: {
    label: 'En revisión',
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  approved: {
    label: 'Aprobada',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  rejected: {
    label: 'Rechazada',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-700 border-red-200',
  },
};

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
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
          .select('*')
          .eq('institution_id', inst.id)
          .order('created_at', { ascending: false });
        setPrograms(progs ?? []);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusConf = institution ? STATUS_CONFIG[institution.status] : null;
  const activePrograms = programs.filter((p) => p.is_active).length;

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="bg-card rounded-2xl border border-border p-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                Panel
              </p>
              {[
                { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
                { href: '/dashboard/programs', label: 'Programas', icon: BookOpen },
                { href: '/dashboard/settings', label: 'Mi institución', icon: Settings },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <div className="lg:col-span-3 space-y-6">
            {/* Greeting */}
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Hola, {profile?.full_name || 'Institución'}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gestiona tu institución y programas desde aquí.
              </p>
            </div>

            {/* No institution yet */}
            {!institution && (
              <div className="bg-card rounded-2xl border border-dashed border-primary/40 p-10 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Registra tu institución</h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                  Aún no has creado tu perfil institucional. Complétalo para aparecer en
                  el explorador de TalentoBAQ.
                </p>
                <Button className="bg-primary hover:bg-primary/90" asChild>
                  <Link href="/dashboard/settings">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear perfil
                  </Link>
                </Button>
              </div>
            )}

            {institution && (
              <>
                {/* Status card */}
                <Card className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="font-bold text-lg leading-tight">{institution.name}</h2>
                          {institution.neighborhood && (
                            <p className="text-sm text-muted-foreground">{institution.neighborhood}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusConf && (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${statusConf.color}`}>
                            <statusConf.icon className="w-3.5 h-3.5" />
                            {statusConf.label}
                          </span>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/dashboard/settings">Editar</Link>
                        </Button>
                      </div>
                    </div>
                    {institution.status === 'rejected' && institution.rejection_reason && (
                      <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm text-red-700">
                          <span className="font-semibold">Motivo:</span> {institution.rejection_reason}
                        </p>
                      </div>
                    )}
                    {institution.status === 'pending' && (
                      <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-sm text-amber-700">
                          Tu institución está siendo revisada por nuestro equipo. Recibirás notificación cuando sea aprobada.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Card className="border-border">
                    <CardContent className="p-5">
                      <p className="text-2xl font-extrabold">{programs.length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Total programas</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-5">
                      <p className="text-2xl font-extrabold text-emerald-600">{activePrograms}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Programas activos</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border col-span-2 sm:col-span-1">
                    <CardContent className="p-5">
                      <p className="text-2xl font-extrabold text-primary">
                        {institution.status === 'approved' ? 'Pública' : 'Privada'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Visibilidad</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick actions */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link href="/dashboard/programs/new" className="group p-5 bg-card rounded-2xl border border-border hover:border-primary/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-primary" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-semibold mb-0.5">Agregar programa</h3>
                    <p className="text-xs text-muted-foreground">Crea un nuevo programa o actividad</p>
                  </Link>

                  {institution.status === 'approved' && (
                    <Link href={`/institution/${institution.id}`} className="group p-5 bg-card rounded-2xl border border-border hover:border-primary/40 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Eye className="w-5 h-5 text-primary" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="font-semibold mb-0.5">Ver perfil público</h3>
                      <p className="text-xs text-muted-foreground">Así te ven los jóvenes</p>
                    </Link>
                  )}
                </div>

                {/* Recent programs */}
                {programs.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold">Programas recientes</h3>
                      <Link href="/dashboard/programs" className="text-xs text-primary hover:underline font-medium">
                        Ver todos
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {programs.slice(0, 3).map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.age_min}–{p.age_max} años • {p.schedule || 'Sin horario'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                              {p.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                            <Link href={`/dashboard/programs/${p.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs">Editar</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
