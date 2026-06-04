'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, XCircle, Clock, Building2, Users,
  LayoutDashboard, Shield, Loader2, Eye, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { Institution, Category } from '@/lib/database.types';

type InstitutionWithCategories = Institution & {
  institution_categories: Array<{ categories: Category }>;
  profiles: { full_name: string; email?: string } | null;
};

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [institutions, setInstitutions] = useState<InstitutionWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; institution: InstitutionWithCategories | null }>({ open: false, institution: null });
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;
    async function load() {
      const { data } = await supabase
        .from('institutions')
        .select(`
          *,
          institution_categories(categories(*)),
          profiles(full_name)
        `)
        .order('created_at', { ascending: false });
      setInstitutions((data ?? []) as any);
      setLoading(false);
    }
    load();
  }, [user, profile]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setProcessing(id);
    const { error } = await supabase
      .from('institutions')
      .update({
        status,
        rejection_reason: reason || null,
        verified: status === 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    setProcessing(null);

    if (error) { toast.error('Error al actualizar'); return; }
    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === id ? { ...inst, status, rejection_reason: reason || null, verified: status === 'approved' } : inst
      )
    );
    toast.success(status === 'approved' ? 'Institución aprobada' : 'Institución rechazada');
    setRejectDialog({ open: false, institution: null });
    setRejectReason('');
  };

  const pending = institutions.filter((i) => i.status === 'pending');
  const approved = institutions.filter((i) => i.status === 'approved');
  const rejected = institutions.filter((i) => i.status === 'rejected');

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profile?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Administración</h1>
            <p className="text-sm text-muted-foreground">Panel de gestión de TalentoBAQ</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-2xl border border-border p-5 text-center">
            <p className="text-3xl font-extrabold text-amber-500">{pending.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pendientes</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5 text-center">
            <p className="text-3xl font-extrabold text-emerald-600">{approved.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Aprobadas</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5 text-center">
            <p className="text-3xl font-extrabold">{institutions.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-3.5 h-3.5" />
              Pendientes
              {pending.length > 0 && (
                <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {pending.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aprobadas
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="w-3.5 h-3.5" />
              Rechazadas
            </TabsTrigger>
          </TabsList>

          {[
            { value: 'pending', items: pending },
            { value: 'approved', items: approved },
            { value: 'rejected', items: rejected },
          ].map(({ value, items }) => (
            <TabsContent key={value} value={value} className="space-y-3">
              {items.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
                  <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay instituciones en esta categoría.</p>
                </div>
              )}
              {items.map((inst) => {
                const cats = inst.institution_categories?.map((ic) => ic.categories) ?? [];
                return (
                  <div key={inst.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-base">{inst.name}</h3>
                          {inst.verified && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Verificada
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {inst.neighborhood && `${inst.neighborhood} • `}
                          {inst.email}
                          {(inst as any).profiles?.full_name && ` • ${(inst as any).profiles.full_name}`}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {cats.map((cat) => (
                            <Badge key={cat?.id} variant="secondary" className="text-xs">
                              {cat?.name}
                            </Badge>
                          ))}
                        </div>
                        {inst.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{inst.description}</p>
                        )}
                        {inst.status === 'rejected' && inst.rejection_reason && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            {inst.rejection_reason}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Button variant="outline" size="sm" asChild className="gap-1.5">
                          <Link href={`/institution/${inst.id}`} target="_blank">
                            <Eye className="w-3.5 h-3.5" />
                            Ver
                          </Link>
                        </Button>
                        {inst.status !== 'approved' && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                            disabled={processing === inst.id}
                            onClick={() => updateStatus(inst.id, 'approved')}
                          >
                            {processing === inst.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Aprobar
                          </Button>
                        )}
                        {inst.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1.5"
                            disabled={processing === inst.id}
                            onClick={() => setRejectDialog({ open: true, institution: inst })}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rechazar
                          </Button>
                        )}
                        {inst.status === 'rejected' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={processing === inst.id}
                            onClick={() => updateStatus(inst.id, 'approved')}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aprobar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, institution: rejectDialog.institution })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar institución</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo. La institución podrá verlo y corregirlo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo del rechazo *</Label>
            <Textarea
              id="reason"
              placeholder="Ej: Falta información de contacto, descripción incompleta..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, institution: null })}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || processing === rejectDialog.institution?.id}
              onClick={() => rejectDialog.institution && updateStatus(rejectDialog.institution.id, 'rejected', rejectReason)}
            >
              {processing === rejectDialog.institution?.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
