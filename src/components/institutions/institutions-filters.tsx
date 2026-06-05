'use client';

import { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/database.types';

export interface FilterState {
  search: string;
  type: 'all' | 'sport' | 'culture';
  categoryIds: string[];
  neighborhood: string;
  modality: 'all' | 'presencial' | 'virtual' | 'mixto';
  gender: 'all' | 'masculino' | 'femenino' | 'mixto';
  ageMin: number;
  ageMax: number;
  priceMin: number;
  priceMax: number;
}

interface InstitutionFiltersProps {
  categories: Category[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults: number;
}

const NEIGHBORHOODS = [
  'El Prado', 'Manga', 'Barranquillita', 'Riomar', 'El Recreo',
  'La Alameda', 'Ciudadela 20 de Julio', 'Villa del Este', 'Los Andes', 'Alto Prado',
];

const DEFAULT_FILTERS: FilterState = {
  search: '', type: 'all', categoryIds: [], neighborhood: '',
  modality: 'all', gender: 'all', ageMin: 0, ageMax: 99,
  priceMin: 0, priceMax: 500000,
};

export { DEFAULT_FILTERS };

export default function InstitutionFilters({ categories, filters, onChange, totalResults }: InstitutionFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const toggleCategory = (id: string) => {
    update({
      categoryIds: filters.categoryIds.includes(id)
        ? filters.categoryIds.filter((c) => c !== id)
        : [...filters.categoryIds, id],
    });
  };

  const clearAll = () => onChange({ ...DEFAULT_FILTERS });

  const hasActiveFilters =
    filters.search || filters.type !== 'all' || filters.categoryIds.length > 0 ||
    filters.neighborhood || filters.modality !== 'all' || filters.gender !== 'all' ||
    filters.ageMin !== 0 || filters.ageMax !== 99 || filters.priceMin !== 0 || filters.priceMax !== 500000;

  const sportCategories = categories.filter((c) => c.type === 'sport');
  const cultureCategories = categories.filter((c) => c.type === 'culture');

  return (
    <aside className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar institución, programa..." value={filters.search} onChange={(e) => update({ search: e.target.value })} className="pl-9" />
        {filters.search && (
          <button onClick={() => update({ search: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Type filter */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Tipo</h3>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'sport', label: 'Deportes' },
            { value: 'culture', label: 'Cultura' },
          ].map((opt) => (
            <button key={opt.value} onClick={() => update({ type: opt.value as FilterState['type'] })}
              className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                filters.type === opt.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sport categories */}
      {(filters.type === 'all' || filters.type === 'sport') && sportCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Deportes</h3>
          <div className="flex flex-wrap gap-1.5">
            {sportCategories.map((cat) => {
              const active = filters.categoryIds.includes(cat.id);
              return (
                <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                  className={cn('px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                    active ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                  )}>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Culture categories */}
      {(filters.type === 'all' || filters.type === 'culture') && cultureCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Cultura y Artes</h3>
          <div className="flex flex-wrap gap-1.5">
            {cultureCategories.map((cat) => {
              const active = filters.categoryIds.includes(cat.id);
              return (
                <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                  className={cn('px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                    active ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                  )}>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Neighborhood */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Barrio</h3>
        <Select value={filters.neighborhood || '_all'} onValueChange={(v) => update({ neighborhood: v === '_all' ? '' : v })}>
          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Todos los barrios" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos los barrios</SelectItem>
            {NEIGHBORHOODS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Advanced toggle */}
      <button onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors w-full">
        <SlidersHorizontal className="w-4 h-4" />
        {showAdvanced ? 'Ocultar filtros avanzados' : 'Más filtros'}
      </button>

      {showAdvanced && (
        <div className="space-y-5 pt-2 border-t border-border">
          {/* Modality */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Modalidad</h3>
            <Select value={filters.modality} onValueChange={(v) => update({ modality: v as FilterState['modality'] })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="mixto">Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gender */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Género</h3>
            <Select value={filters.gender} onValueChange={(v) => update({ gender: v as FilterState['gender'] })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="mixto">Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age range */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Edad: {filters.ageMin} - {filters.ageMax} años</h3>
            <Slider min={0} max={99} step={1} value={[filters.ageMin, filters.ageMax]}
              onValueChange={([min, max]) => update({ ageMin: min, ageMax: max })} className="mt-2" />
          </div>

          {/* Price range */}
          <div>
            <h3 className="text-sm font-semibold mb-2">
              Precio: ${filters.priceMin.toLocaleString('es-CO')} - ${filters.priceMax.toLocaleString('es-CO')} COP
            </h3>
            <Slider min={0} max={500000} step={10000} value={[filters.priceMin, filters.priceMax]}
              onValueChange={([min, max]) => update({ priceMin: min, priceMax: max })} className="mt-2" />
          </div>
        </div>
      )}

      {/* Results + clear */}
      <div className="pt-2 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalResults}</span> {totalResults === 1 ? 'resultado' : 'resultados'}
        </p>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            <X className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>
    </aside>
  );
}
