'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/layout/header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { Institution, Event } from '@/lib/database.types';

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({ title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', image_url: '' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: inst } = await supabase.from('institutions').select('*').eq('user_id', user!.id).maybeSingle();
      if (!inst) { setLoading(false); return; }
      setInstitution(inst);
      const { data: evts } = await supabase.from('events').select('*').eq('institution_id', inst.id).order('event_date', { ascending: true });
      setEvents(evts ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  const openCreate = () => {
    setEditEvent(null);
    setForm({ title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', image_url: '' });
    setDialogOpen(true);
  };

  const openEdit = (evt: Event) => {
    setEditEvent(evt);
    setForm({
      title: evt.title, description: evt.description || '', event_date: evt.event_date,
      start_time: evt.start_time?.slice(0, 5) || '', end_time: evt.end_time?.slice(0, 5) || '',
      location: evt.location || '', image_url: evt.image_url || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution) return;
    setSaving(true);
    const payload: any = {
      institution_id: institution.id, title: form.title, description: form.description,
      event_date: form.event_date, start_time: form.start_time || null, end_time: form.end_time || null,
      location: form.location, image_url: form.image_url || null,
    };

    if (editEvent) {
      const { error } = await supabase.from('events').update(payload).eq('id', editEvent.id);
      if (error) { toast.error('Error al guardar'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('events').insert(payload);
      if (error) { toast.error('Error al crear'); setSaving(false); return; }
    }

    const { data } = await supabase.from('events').select('*').eq('institution_id', institution.id).order('event_date', { ascending: true });
    setEvents(data ?? []);
    setSaving(false);
    setDialogOpen(false);
    toast.success(editEvent ? 'Evento actualizado' : 'Evento creado');
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) { toast.error('Error al eliminar'); return; }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast.success('Evento eliminado');
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.event_date >= today);
  const past = events.filter((e) => e.event_date < today);

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="gap-1.5"><Link href="/dashboard"><ArrowLeft className="w-4 h-4" />Volver</Link></Button>
            <h1 className="text-xl font-extrabold">Eventos</h1>
          </div>
          {institution && (
            <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Nuevo evento
            </Button>
          )}
        </div>

        {!institution ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Primero debes crear tu institución.</p>
            <Button className="mt-4" asChild><Link href="/dashboard/settings">Crear institución</Link></Button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <h3 className="font-semibold text-foreground mb-1">Sin eventos</h3>
            <p className="text-sm">Organiza torneos, festivales o presentaciones.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <div>
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Próximos</h2>
                <div className="space-y-3">
                  {upcoming.map((evt) => (
                    <div key={evt.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs text-primary font-bold">{new Date(evt.event_date + 'T12:00:00').toLocaleDateString('es-CO', { month: 'short' })}</span>
                        <span className="text-lg font-extrabold text-primary">{new Date(evt.event_date + 'T12:00:00').getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{evt.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {evt.start_time && `${evt.start_time.slice(0, 5)} - ${evt.end_time?.slice(0, 5) || ''}`}
                          {evt.location && ` • ${evt.location}`}
                        </p>
                        {evt.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{evt.description}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(evt)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Eliminar evento</AlertDialogTitle>
                              <AlertDialogDescription>Se eliminará &ldquo;{evt.title}&rdquo; permanentemente.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteEvent(evt.id)}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Pasados</h2>
                <div className="space-y-2">
                  {past.map((evt) => (
                    <div key={evt.id} className="bg-card rounded-xl border border-border p-3 flex items-center justify-between opacity-60">
                      <div>
                        <p className="text-sm font-medium">{evt.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(evt.event_date + 'T12:00:00').toLocaleDateString('es-CO')}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => deleteEvent(evt.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editEvent ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
            <DialogDescription>{editEvent ? 'Modifica los detalles del evento.' : 'Organiza un torneo, festival o presentación.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5"><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Torneo de fútbol juvenil" required /></div>
            <div className="space-y-1.5"><Label>Fecha *</Label><Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Hora inicio</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Hora fin</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Ubicación</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Cancha principal, El Prado" /></div>
            <div className="space-y-1.5"><Label>Descripción</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Detalles del evento..." /></div>
            <div className="space-y-1.5"><Label>URL de imagen</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editEvent ? 'Guardar' : 'Crear evento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
