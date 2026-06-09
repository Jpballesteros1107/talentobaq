'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, XCircle, Clock, Building2, Users,
  Shield, Loader2, Eye, AlertTriangle, Plus, Pencil,
  Trash2, BookOpen, LayoutList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import Header from '@/components/layout/header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { Institution, Category, Profile } from '@/lib/database.types';

type InstitutionWithCategories = Institution & {
  institution_categories: Array<{ categories: Category }>;
  profiles: { full_name: string } | null;
};

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [institutions, setInstitutions] = useState<InstitutionWithCategories[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; institution: InstitutionWithCategories | null }>({ open: false, institution: null });
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ name: '', type: 'sport', icon: 'star', color: 'bg-teal-500', sort_order: '0' });
  const [catDialog, setCatDialog] = useState<{ open: boolean; edit: Category | null }>({ open: false, edit: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) router.push('/');
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;
    async function load() {
      const [instRes, userRes, catRes] = await Promise.all([
        supabase.from('institutions').select(`*, institution_categories(categories(*)), profiles(full_name)`).order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order'),
      ]);
      setInstitutions((instRes.data ?? []) as any);
      setUsers(userRes.data ?? []);
      setCategories(catRes.data ?? []);
      setLoading(false);
    }
    load();
  }, [user, profile]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setProcessing(id);
    const { error } = await supabase.from('institutions').update({
      status, rejection_reason: reason || null, verified: status === 'approved', updated_at: new Date().toISOString(),
    }).eq('id', id);
    setProcessing(null);
    if (error) { toast.error('Error al actualizar'); return; }
    setInstitutions((prev) => prev.map((inst) => inst.id === id ? { ...inst, status, rejection_reason: reason || null, verified: status === 'approved' } : inst));
    toast.success(status === 'approved' ? 'Institución aprobada' : 'Institución rechazada');
    setRejectDialog({ open: false, institution: null });
    setRejectReason('');
  };

  const saveCategory = async () => {
    setSaving(true);
    const payload = { name: catForm.name, type: catForm.type as 'sport' | 'culture', icon: catForm.icon, color: catForm.color, sort_order: parseInt(catForm.sort_order) || 0 };
    let error;
    if (catDialog.edit) {
      ({ error } = await supabase.from('categories').update(payload).eq('id', catDialog.edit.id));
    } else {
      ({ error } = await supabase.from('categories').insert(payload));
    }
    setSaving(false);
    if (error) { toast.error('Error al guardar categoría'); return; }
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data ?? []);
    toast.success(catDialog.edit ? 'Categoría actualizada' : 'Categoría creada');
    setCatDialog({ open: false, edit: null });
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { toast.error('Error al eliminar'); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success('Categoría eliminada');
  };

  const suspendUser = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ role: 'public' }).eq('id', id);
    if (error) { toast.error('Error'); return; }
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: 'public' } : u));
    toast.success('Usuario suspendido');
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (profile?.role !== 'admin') return null;

  const pending = institutions.filter((i) => i.status === 'pending');
  const approved = institutions.filter((i) => i.status === 'approved');
  const rejected = institutions.filter((i) => i.status === 'rejected');
  const publicUsers = users.filter((u) => u.role === 'public');
  const institutionUsers = users.filter((u) => u.role === 'institution');

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-extrabold">Administración</h1>
            <p className="text-sm text-muted-foreground">Panel de gestión de TalentoBAQ</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { value: users.length, label: 'Usuarios', icon: Users, color: 'text-primary' },
            { value: institutions.length, label: 'Instituciones', icon: Building2, color: 'text-primary' },
            { value: pending.length, label: 'Pendientes', icon: Clock, color: 'text-amber-500' },
            { value: categories.length, label: 'Categorías', icon: LayoutList, color: 'text-primary' },
            { value: approved.length, label: 'Aprobadas', icon: CheckCircle2, color: 'text-emerald-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl border border-border p-5 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="pending" className="gap-2"><Clock className="w-3.5 h-3.5" />Pendientes {pending.length > 0 && <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">{pending.length}</span>}</TabsTrigger>
            <TabsTrigger value="approved" className="gap-2"><CheckCircle2 className="w-3.5 h-3.5" />Aprobadas</TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2"><XCircle className="w-3.5 h-3.5" />Rechazadas</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="w-3.5 h-3.5" />Usuarios</TabsTrigger>
            <TabsTrigger value="categories" className="gap-2"><LayoutList className="w-3.5 h-3.5" />Categorías</TabsTrigger>
          </TabsList>

          {/* Institution tabs */}
          {[
            { value: 'pending', items: pending },
            { value: 'approved', items: approved },
            { value: 'rejected', items: rejected },
          ].map(({ value, items }) => (
            <TabsContent key={value} value={value} className="space-y-3">
              {items.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
                  <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Sin instituciones en esta categoría.</p>
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
                          {inst.verified && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Verificada</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{inst.neighborhood && `${inst.neighborhood} • `}{inst.email}{(inst as any).profiles?.full_name && ` • ${(inst as any).profiles.full_name}`}</p>
                        <div className="flex flex-wrap gap-1.5 mb-2">{cats.map((cat) => cat && <Badge key={cat.id} variant="secondary" className="text-xs">{cat.name}</Badge>)}</div>
                        {inst.description && <p className="text-sm text-muted-foreground line-clamp-2">{inst.description}</p>}
                        {inst.status === 'rejected' && inst.rejection_reason && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{inst.rejection_reason}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {inst.status !== 'approved' && (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5" disabled={processing === inst.id} onClick={() => updateStatus(inst.id, 'approved')}>
                            {processing === inst.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}Aprobar
                          </Button>
                        )}
                        {inst.status !== 'rejected' && (
                          <Button size="sm" variant="destructive" className="gap-1.5" disabled={processing === inst.id} onClick={() => setRejectDialog({ open: true, institution: inst })}>
                            <XCircle className="w-3.5 h-3.5" />Rechazar
                          </Button>
                        )}
                        {inst.status === 'rejected' && (
                          <Button size="sm" variant="outline" className="gap-1.5" disabled={processing === inst.id} onClick={() => updateStatus(inst.id, 'approved')}>
                            <CheckCircle2 className="w-3.5 h-3.5" />Aprobar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          ))}

          {/* Users tab */}
          <TabsContent value="users" className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{users.length}</span> usuarios registrados</p>
            </div>
            {users.map((u) => (
              <div key={u.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{u.full_name || 'Sin nombre'}</p>
                  <p className="text-xs text-muted-foreground">{u.email} • {u.role === 'institution' ? 'Institución' : u.role === 'admin' ? 'Admin' : 'Familia'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-xs capitalize">{u.role === 'public' ? 'Familia' : u.role}</Badge>
                  {u.role !== 'admin' && (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => suspendUser(u.id)}>Suspender</Button>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Categories tab */}
          <TabsContent value="categories" className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{categories.length}</span> categorías</p>
              <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1.5" onClick={() => { setCatForm({ name: '', type: 'sport', icon: 'star', color: 'bg-teal-500', sort_order: '0' }); setCatDialog({ open: true, edit: null }); }}>
                <Plus className="w-3.5 h-3.5" />Nueva categoría
              </Button>
            </div>
            {categories.map((cat) => (
              <div key={cat.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge variant={cat.type === 'sport' ? 'default' : 'secondary'} className="text-xs">{cat.type === 'sport' ? 'Deporte' : 'Cultura'}</Badge>
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setCatForm({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color, sort_order: String(cat.sort_order) }); setCatDialog({ open: true, edit: cat }); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => deleteCategory(cat.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, institution: rejectDialog.institution })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rechazar institución</DialogTitle><DialogDescription>Indica el motivo del rechazo.</DialogDescription></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo *</Label>
            <Textarea id="reason" placeholder="Ej: Falta información de contacto..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, institution: null })}>Cancelar</Button>
            <Button variant="destructive" disabled={!rejectReason.trim() || processing === rejectDialog.institution?.id}
              onClick={() => rejectDialog.institution && updateStatus(rejectDialog.institution.id, 'rejected', rejectReason)}>
              {processing === rejectDialog.institution?.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Confirmar rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category dialog */}
      <Dialog open={catDialog.open} onOpenChange={(open) => setCatDialog({ open, edit: null })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{catDialog.edit ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Nombre *</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Ej: Patinaje" /></div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={catForm.type} onValueChange={(v) => setCatForm({ ...catForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="sport">Deporte</SelectItem><SelectItem value="culture">Cultura</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Icono</Label><Input value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} placeholder="star" /></div>
              <div className="space-y-1.5"><Label>Orden</Label><Input type="number" value={catForm.sort_order} onChange={(e) => setCatForm({ ...catForm, sort_order: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog({ open: false, edit: null })}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90" disabled={!catForm.name.trim() || saving} onClick={saveCategory}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{catDialog.edit ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
