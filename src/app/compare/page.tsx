'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Plus, ArrowRight, CheckCircle2, MapPin, Star, Users, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { supabase } from '@/lib/supabase';
import type { Category, Institution, Program } from '@/lib/database.types';

type InstitutionFull = Institution & {
  institution_categories: Array<{ categories: Category }>;
  programs: Program[];
  reviews: { rating: number }[];
};

export default function ComparePage() {
  const [allInstitutions, setAllInstitutions] = useState<InstitutionFull[]>([]);
  const [selected, setSelected] = useState<InstitutionFull[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('institutions')
        .select(`*, institution_categories(categories(*)), programs(*), reviews(rating)`)
        .eq('status', 'approved')
        .order('name');
      setAllInstitutions((data ?? []) as any);
      setLoading(false);
    }
    load();
  }, []);

  const addInstitution = (inst: InstitutionFull) => {
    if (selected.length >= 3 || selected.some((s) => s.id === inst.id)) return;
    setSelected((prev) => [...prev, inst]);
  };

  const removeInstitution = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  };

  const filtered = allInstitutions.filter((inst) =>
    !selected.some((s) => s.id === inst.id) &&
    (inst.name.toLowerCase().includes(search.toLowerCase()) || inst.neighborhood?.toLowerCase().includes(search.toLowerCase()))
  );

  const getAvgRating = (inst: InstitutionFull) => {
    const reviews = inst.reviews ?? [];
    return reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';
  };

  const getPriceRange = (inst: InstitutionFull) => {
    const active = inst.programs?.filter((p) => p.is_active) ?? [];
    if (active.length === 0) return '—';
    const prices = active.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === 0 && max === 0) return 'Gratuito';
    if (min === max) return `$${min.toLocaleString('es-CO')}`;
    return `$${min.toLocaleString('es-CO')} - $${max.toLocaleString('es-CO')}`;
  };

  const getAgeRange = (inst: InstitutionFull) => {
    const active = inst.programs?.filter((p) => p.is_active) ?? [];
    if (active.length === 0) return '—';
    const minAge = Math.min(...active.map((p) => p.age_min));
    const maxAge = Math.max(...active.map((p) => p.age_max));
    return `${minAge} - ${maxAge} años`;
  };

  const getProgramCount = (inst: InstitutionFull) => inst.programs?.filter((p) => p.is_active).length ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="border-b border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Comparar instituciones</h1>
          <p className="text-muted-foreground text-sm">Selecciona hasta 3 instituciones para compararlas lado a lado</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 flex-1">
        {/* Selection bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {selected.map((inst) => (
            <div key={inst.id} className="flex items-center gap-2 bg-card border border-border rounded-full pl-3 pr-1 py-1">
              <span className="text-sm font-medium">{inst.name}</span>
              <button onClick={() => removeInstitution(inst.id)} className="w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {selected.length < 3 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                  <Plus className="w-3.5 h-3.5" /> Agregar institución
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Seleccionar institución</DialogTitle></DialogHeader>
                <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4" />
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filtered.map((inst) => (
                    <button key={inst.id} onClick={() => { addInstitution(inst); setSearch(''); }}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors">
                      <p className="text-sm font-medium">{inst.name}</p>
                      <p className="text-xs text-muted-foreground">{inst.neighborhood} • {inst.institution_categories?.map((ic) => ic.categories?.name).join(', ')}</p>
                    </button>
                  ))}
                  {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Sin resultados</p>}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Comparison table */}
        {selected.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Plus className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <h3 className="font-semibold text-foreground mb-1">Selecciona instituciones para comparar</h3>
            <p className="text-sm">Usa el boton de arriba para agregar hasta 3 instituciones.</p>
          </div>
        )}

        {selected.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-sm font-bold text-muted-foreground p-4 w-40 bg-muted/30 rounded-tl-xl">Característica</th>
                  {selected.map((inst, i) => (
                    <th key={inst.id} className={`text-left p-4 bg-muted/30 ${i === selected.length - 1 ? 'rounded-tr-xl' : ''}`}>
                      <Link href={`/institution/${inst.id}`} className="group">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-base group-hover:text-primary transition-colors">{inst.name}</h3>
                          {inst.verified && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </div>
                        <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Ver perfil <ArrowRight className="w-3 h-3" /></span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { label: 'Barrio', icon: MapPin, getValue: (i: InstitutionFull) => i.neighborhood || '—' },
                  { label: 'Categorías', icon: CheckCircle2, getValue: (i: InstitutionFull) => i.institution_categories?.map((ic) => ic.categories?.name).filter(Boolean).join(', ') || '—' },
                  { label: 'Programas', icon: Users, getValue: (i: InstitutionFull) => `${getProgramCount(i)} programas` },
                  { label: 'Rango de edad', icon: Users, getValue: (i: InstitutionFull) => getAgeRange(i) },
                  { label: 'Precios', icon: DollarSign, getValue: (i: InstitutionFull) => getPriceRange(i) },
                  { label: 'Calificación', icon: Star, getValue: (i: InstitutionFull) => getAvgRating(i) },
                  { label: 'Modalidades', icon: Clock, getValue: (i: InstitutionFull) => Array.from(new Set(i.programs?.map((p) => p.modality) ?? [])).join(', ') || '—' },
                  { label: 'Teléfono', icon: MapPin, getValue: (i: InstitutionFull) => i.phone || '—' },
                  { label: 'Email', icon: MapPin, getValue: (i: InstitutionFull) => i.email || '—' },
                  { label: 'Descripción', icon: MapPin, getValue: (i: InstitutionFull) => i.description ? (i.description.length > 100 ? i.description.slice(0, 100) + '...' : i.description) : '—' },
                ].map((row) => (
                  <tr key={row.label} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2"><row.icon className="w-4 h-4 text-primary" />{row.label}</div>
                    </td>
                    {selected.map((inst) => (
                      <td key={inst.id} className="p-4 text-sm">{row.getValue(inst)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
