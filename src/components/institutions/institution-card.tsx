import Link from 'next/link';
import Image from 'next/image';
import { MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Institution, Category } from '@/lib/database.types';

interface InstitutionCardProps {
  institution: Institution & {
    institution_categories?: Array<{
      categories: Category;
    }>;
    programs?: { id: string }[];
  };
}

const COVER_FALLBACKS = [
  'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=800',
];

function getCoverImage(institution: Institution) {
  if (institution.cover_url) return institution.cover_url;
  const idx = institution.id.charCodeAt(0) % COVER_FALLBACKS.length;
  return COVER_FALLBACKS[idx];
}

export default function InstitutionCard({ institution }: InstitutionCardProps) {
  const categories = institution.institution_categories?.map((ic) => ic.categories) ?? [];
  const programCount = institution.programs?.length ?? 0;

  return (
    <Link href={`/institution/${institution.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5">
        {/* Cover image */}
        <div className="relative h-44 overflow-hidden bg-muted">
          <img
            src={getCoverImage(institution)}
            alt={institution.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Verified badge */}
          {institution.verified && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3" />
              Verificado
            </div>
          )}

          {/* Categories */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {categories.slice(0, 2).map((cat) => (
              <span
                key={cat.id}
                className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-medium"
              >
                {cat.name}
              </span>
            ))}
            {categories.length > 2 && (
              <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-medium">
                +{categories.length - 2}
              </span>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {institution.name}
            </h3>
          </div>

          {(institution.neighborhood || institution.address) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{institution.neighborhood || institution.address}</span>
            </div>
          )}

          {institution.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {institution.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground font-medium">
              {programCount} {programCount === 1 ? 'programa' : 'programas'}
            </span>
            <span className="text-xs text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              Ver más
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
