'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import Header from '@/components/layout/header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { Category, Institution } from '@/lib/database.types';

interface ProgramForm {
  name: string;
  description: string;
  category_id: string;
  schedule: string;
  price: string;
  age_min: string;
  age_max: string;
  spots_available: string;
  is_active: boolean;
}

const DEFAULT_FORM: ProgramForm = {
  name: '',
  description: '',
  category_id: '',
  schedule: '',
  price: '0',
  age_min: '5',
  age_max: '18',
  spots_available: '',
  is_active: true,
};

interface ProgramFormPageProps {
  programId?: string;
}

export default function ProgramFormPage({ programId }: ProgramFormPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProgramForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const isEditing = Boolean(programId);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [instRes, catsRes] = await Promise.all([
        supabase.from('institutions').select('*').eq('user_id', user!.id).maybeSingle(),
        supabase.from('categories').select('*').order('sort_order'),
      ]);
      setInstitution(instRes.data);
      setCategories(catsRes.data ?? []);

      if (programId && instRes.data) {
        const { data: prog } = await supabase
          .from('programs')
          .select('*')
          .eq('id', programId)
          .eq('institution_id', instRes.data.id)
          .maybeSingle();
        if (prog) {
          setForm({
            name: prog.name,
            description: prog.description || '',
            category_id: prog.category_id || '',
            schedule: prog.schedule || '',
            price: String(prog.price),
            age_min: String(prog.age_min),
            age_max: String(prog.age_max),
            spots_available: prog.spots_available ? String(prog.spots_available) : '',
            is_active: prog.is_active,
          });
        }
      }
      setLoading(false);
    }
    load();
  }, [user, programId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution) { toast.error('No se encontró la institución'); return; }

    setSaving(true);
    const payload = {
      institution_id: institution.id,
      name: form.name,
      description: form.description,
      category_id: form.category_id || null,
      schedule: form.schedule,
      price: parseFloat(form.price) || 0,
      age_min: parseInt(form.age_min) || 0,
      age_max: parseInt(form.age_max) || 99,
      spots_available: form.spots_available ? parseInt(form.spots_available) : null,
      is_active: form.is_active,
    };

    let error;
    if (isEditing) {
      ({ error } = await supabase.from('programs').update(payload).eq('id', programId!));
    } else {
      ({ error } = await supabase.from('programs').insert(payload));
    }
    setSaving(false);

    if (error) { toast.error('Error al guardar el programa'); return; }
    toast.success(isEditing ? 'Programa actualizado' : 'Programa creado');
    router.push('/dashboard/programs');
  };

  const update = (field: keyof ProgramForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/dashboard/programs">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-extrabold">
              {isEditing ? 'Editar programa' : 'Nuevo programa'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre del programa *</Label>
            <Input
              id="name"
              placeholder="Ej: Escuela de fútbol infantil"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el programa, qué aprenderán, metodología..."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={form.category_id} onValueChange={(v) => update('category_id', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="schedule">Horario</Label>
            <Input
              id="schedule"
              placeholder="Ej: Lunes y Miércoles 4pm - 6pm"
              value={form.schedule}
              onChange={(e) => update('schedule', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="age_min">Edad mínima</Label>
              <Input
                id="age_min"
                type="number"
                min={0}
                max={100}
                value={form.age_min}
                onChange={(e) => update('age_min', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age_max">Edad máxima</Label>
              <Input
                id="age_max"
                type="number"
                min={0}
                max={100}
                value={form.age_max}
                onChange={(e) => update('age_max', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Precio mensual (COP)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                placeholder="0 = Gratuito"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spots">Cupos disponibles</Label>
              <Input
                id="spots"
                type="number"
                min={1}
                placeholder="Ilimitado"
                value={form.spots_available}
                onChange={(e) => update('spots_available', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="text-sm font-medium">Programa activo</p>
              <p className="text-xs text-muted-foreground">Los programas activos son visibles públicamente.</p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => update('is_active', v)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" asChild className="flex-1">
              <Link href="/dashboard/programs">Cancelar</Link>
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isEditing ? 'Guardar cambios' : 'Crear programa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
