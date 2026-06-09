'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/layout/header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { Category, Institution } from '@/lib/database.types';

export default function InstitutionSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    neighborhood: '',
    phone: '',
    email: '',
    website: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [instRes, catsRes] = await Promise.all([
        supabase
          .from('institutions')
          .select('*, institution_categories(category_id)')
          .eq('user_id', user!.id)
          .maybeSingle(),
        supabase.from('categories').select('*').order('sort_order'),
      ]);
      setCategories(catsRes.data ?? []);

      if (instRes.data) {
        const inst = instRes.data as any;
        setInstitution(inst);
        setForm({
          name: inst.name || '',
          description: inst.description || '',
          address: inst.address || '',
          neighborhood: inst.neighborhood || '',
          phone: inst.phone || '',
          email: inst.email || '',
          website: inst.website || '',
          latitude: inst.latitude ? String(inst.latitude) : '',
          longitude: inst.longitude ? String(inst.longitude) : '',
        });
        setSelectedCats(inst.institution_categories?.map((ic: any) => ic.category_id) ?? []);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const toggleCat = (id: string) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (institution) {
      const { error } = await supabase
        .from('institutions')
        .update({
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', institution.id);
      if (error) { toast.error('Error al guardar'); setSaving(false); return; }

      await supabase.from('institution_categories').delete().eq('institution_id', institution.id);
      if (selectedCats.length > 0) {
        await supabase.from('institution_categories').insert(
          selectedCats.map((cid) => ({ institution_id: institution.id, category_id: cid }))
        );
      }
      toast.success('Institución actualizada');
    } else {
      const { data: newInst, error } = await supabase
        .from('institutions')
        .insert({
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
          user_id: user!.id,
        })
        .select()
        .single();
      if (error) { toast.error('Error al crear la institución'); setSaving(false); return; }

      if (selectedCats.length > 0) {
        await supabase.from('institution_categories').insert(
          selectedCats.map((cid) => ({ institution_id: newInst.id, category_id: cid }))
        );
      }
      setInstitution(newInst);
      toast.success('Institución creada. Está en revisión.');
    }
    setSaving(false);
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sportCats = categories.filter((c) => c.type === 'sport');
  const cultureCats = categories.filter((c) => c.type === 'culture');

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-extrabold">
              {institution ? 'Mi institución' : 'Crear institución'}
            </h1>
            {!institution && (
              <p className="text-xs text-muted-foreground">Será revisada antes de aparecer públicamente</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
              Información básica
            </h2>
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre de la institución *</Label>
              <Input id="name" placeholder="Club Deportivo Barranquilla" value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Describe tu institución, misión y actividades principales..." value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
              Categorías
            </h2>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Deportes</p>
              <div className="flex flex-wrap gap-2">
                {sportCats.map((cat) => {
                  const active = selectedCats.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCat(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Cultura y Artes</p>
              <div className="flex flex-wrap gap-2">
                {cultureCats.map((cat) => {
                  const active = selectedCats.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCat(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
              Contacto y ubicación
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="neighborhood">Barrio</Label>
                <Input id="neighborhood" placeholder="El Prado" value={form.neighborhood} onChange={(e) => update('neighborhood', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                <Input id="phone" placeholder="300 000 0000" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" placeholder="Cra 50 # 80-20" value={form.address} onChange={(e) => update('address', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="info@miclub.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Sitio web</Label>
                <Input id="website" type="url" placeholder="https://miclub.com" value={form.website} onChange={(e) => update('website', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="latitude">Latitud</Label>
                <Input id="latitude" type="number" step="any" placeholder="10.9685" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="longitude">Longitud</Label>
                <Input id="longitude" type="number" step="any" placeholder="-74.7813" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresa las coordenadas para mostrar tu ubicación en el mapa. Encuéntralas en Google Maps (click derecho en tu ubicación).
            </p>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-semibold h-11" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {institution ? 'Guardar cambios' : 'Crear institución'}
          </Button>
        </form>
      </div>
    </div>
  );
}
