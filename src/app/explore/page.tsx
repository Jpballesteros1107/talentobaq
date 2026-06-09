'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grid3X3, List, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import InstitutionCard from '@/components/institutions/institution-card';
import InstitutionFilters, { FilterState, DEFAULT_FILTERS } from '@/components/institutions/institutions-filters';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { supabase } from '@/lib/supabase';
import type { Category, Institution } from '@/lib/database.types';
import { cn } from '@/lib/utils';

type InstitutionWithRelations = Institution & {
  institution_categories: Array<{ categories: Category }>;
  programs: { id: string; price: number; age_min: number; age_max: number; modality: string; gender: string; is_active: boolean }[];
};

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const [institutions, setInstitutions] = useState<InstitutionWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    type: (searchParams.get('type') as FilterState['type']) || 'all',
    categoryIds: searchParams.get('category') ? [searchParams.get('category')!] : [],
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    async function fetchInstitutions() {
      setLoading(true);
      let query = supabase
        .from('institutions')
        .select(`*, institution_categories(categories(*)), programs(id, price, age_min, age_max, modality, gender, is_active)`)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,neighborhood.ilike.%${filters.search}%`);
      }
      if (filters.neighborhood) {
        query = query.ilike('neighborhood', `%${filters.neighborhood}%`);
      }

      const { data } = await query;
      let results = (data ?? []) as InstitutionWithRelations[];

      // Client-side filters for type, categories, modality, gender, age, price
      if (filters.type !== 'all') {
        results = results.filter((inst) =>
          inst.institution_categories.some((ic) => ic.categories?.type === filters.type)
        );
      }
      if (filters.categoryIds.length > 0) {
        results = results.filter((inst) =>
          filters.categoryIds.some((cid) => inst.institution_categories.some((ic) => ic.categories?.id === cid))
        );
      }
      if (filters.modality !== 'all') {
        results = results.filter((inst) =>
          inst.programs.some((p) => p.is_active && p.modality === filters.modality)
        );
      }
      if (filters.gender !== 'all') {
        results = results.filter((inst) =>
          inst.programs.some((p) => p.is_active && p.gender === filters.gender)
        );
      }
      if (filters.ageMin > 0 || filters.ageMax < 99) {
        results = results.filter((inst) =>
          inst.programs.some((p) => p.is_active && p.age_min <= filters.ageMax && p.age_max >= filters.ageMin)
        );
      }
      if (filters.priceMin > 0 || filters.priceMax < 500000) {
        results = results.filter((inst) =>
          inst.programs.some((p) => p.is_active && p.price >= filters.priceMin && p.price <= filters.priceMax)
        );
      }

      setInstitutions(results);
      setLoading(false);
    }
    fetchInstitutions();
  }, [filters]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="border-b border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Explorar instituciones</h1>
          <p className="text-muted-foreground text-sm">Clubes deportivos y culturales verificados de Barranquilla</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 flex-1">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <InstitutionFilters categories={categories} filters={filters} onChange={setFilters} totalResults={institutions.length} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5 gap-4">
              <p className="text-sm text-muted-foreground hidden sm:block">
                <span className="font-semibold text-foreground">{institutions.length}</span> {institutions.length === 1 ? 'institución encontrada' : 'instituciones encontradas'}
              </p>
              <div className="flex items-center gap-2 ml-auto">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-2">
                      <SlidersHorizontal className="w-4 h-4" /> Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
                    <div className="mt-6">
                      <InstitutionFilters categories={categories} filters={filters} onChange={setFilters} totalResults={institutions.length} />
                    </div>
                  </SheetContent>
                </Sheet>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setView('grid')} className={cn('p-2 transition-colors', view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setView('list')} className={cn('p-2 transition-colors', view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
              </div>
            ) : institutions.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center"><X className="w-6 h-6" /></div>
                <h3 className="font-semibold text-foreground mb-1">Sin resultados</h3>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
              </div>
            ) : (
              <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {institutions.map((inst) => <InstitutionCard key={inst.id} institution={inst} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
