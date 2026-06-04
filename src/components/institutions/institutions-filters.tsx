'use client';

import { useState, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/database.types';

export interface FilterState {
  search: string;
  type: 'all' | 'sport' | 'culture';
  categoryIds: string[];
  neighborhood: string;
}

interface InstitutionFiltersProps {
  categories: Category[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults: number;
}

const NEIGHBORHOODS = [
  'El Prado',
  'Manga',
  'Barranquillita',
  'Riomar',
  'El Recreo',
  'La Alameda',
  'Ciudadela 20 de Julio',
  'Villa del Este',
  'Los Andes',
  'Alto Prado',
];

export default function InstitutionFilters({
  categories,
  filters,
  onChange,
  totalResults,
}: InstitutionFiltersProps) {
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);

  const update = useCallback(
    (patch: Partial<FilterState>) => onChange({ ...filters, ...patch }),
    [filters, onChange]
  );

  const toggleCategory = (id: string) => {
    const exists = filters.categoryIds.includes(id);
    update({
      categoryIds: exists
        ? filters.categoryIds.filter((c) => c !== id)
        : [...filters.categoryIds, id],
    });
  };

  const clearAll = () => {
    onChange({ search: '', type: 'all', categoryIds: [], neighborhood: '' });
  };

  const hasActiveFilters =
    filters.search ||
    filters.type !== 'all' ||
    filters.categoryIds.length > 0 ||
    filters.neighborhood;

  const sportCategories = categories.filter((c) => c.type === 'sport');
  const cultureCategories = categories.filter((c) => c.type === 'culture');

  return (
    <aside className="space-y-6">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar institución..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Type filter */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Tipo</h3>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'sport', label: 'Deportes' },
            { value: 'culture', label: 'Cultura' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ type: opt.value as FilterState['type'] })}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                filters.type === opt.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sport categories */}
      {(filters.type === 'all' || filters.type === 'sport') && sportCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Deportes</h3>
          <div className="flex flex-wrap gap-2">
            {sportCategories.map((cat) => {
              const active = filters.categoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    active
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
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
          <h3 className="text-sm font-semibold mb-3 text-foreground">Cultura</h3>
          <div className="flex flex-wrap gap-2">
            {cultureCategories.map((cat) => {
              const active = filters.categoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    active
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Neighborhood filter */}
      <div>
        <button
          onClick={() => setShowNeighborhoods(!showNeighborhoods)}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-2"
        >
          Barrio
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
        {showNeighborhoods && (
          <div className="flex flex-wrap gap-2 mt-2">
            {NEIGHBORHOODS.map((n) => {
              const active = filters.neighborhood === n;
              return (
                <button
                  key={n}
                  onClick={() => update({ neighborhood: active ? '' : n })}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                    active
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
        )}
        {filters.neighborhood && (
          <p className="text-xs text-primary mt-2 font-medium">{filters.neighborhood}</p>
        )}
      </div>

      {/* Results count + clear */}
      <div className="pt-2 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalResults}</span>{' '}
          {totalResults === 1 ? 'resultado' : 'resultados'}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>
    </aside>
  );
}
