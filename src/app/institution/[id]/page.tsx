import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Globe, CheckCircle2, ArrowLeft,
  Calendar, Users, DollarSign, Tag, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { supabase } from '@/lib/supabase';

const COVER_FALLBACKS = [
  'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

async function getInstitution(id: string) {
  const { data } = await supabase
    .from('institutions')
    .select(`
      *,
      institution_categories(
        categories(*)
      ),
      programs(*)
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle();
  return data;
}

export default async function InstitutionDetailPage({ params }: { params: { id: string } }) {
  const institution = await getInstitution(params.id);
  if (!institution) notFound();

  const categories = (institution as any).institution_categories?.map((ic: any) => ic.categories) ?? [];
  const programs = (institution as any).programs ?? [];
  const activePrograms = programs.filter((p: any) => p.is_active);

  const coverImg = institution.cover_url || COVER_FALLBACKS[institution.id.charCodeAt(0) % COVER_FALLBACKS.length];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Cover */}
      <div className="relative h-56 sm:h-72 overflow-hidden bg-muted">
        <img src={coverImg} alt={institution.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <Link href="/explore" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title block */}
            <div>
              <div className="flex items-start gap-3 flex-wrap mb-3">
                <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
                  {institution.name}
                </h1>
                {institution.verified && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verificado
                  </Badge>
                )}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat: any) => (
                  <Badge key={cat.id} variant="secondary" className="text-xs">
                    {cat.name}
                  </Badge>
                ))}
              </div>

              {(institution.neighborhood || institution.address) && (
                <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 shrink-0 text-primary" />
                  {[institution.neighborhood, institution.address].filter(Boolean).join(' — ')}
                </p>
              )}
            </div>

            <Separator />

            {/* Description */}
            {institution.description && (
              <div>
                <h2 className="text-lg font-bold mb-3">Acerca de la institución</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {institution.description}
                </p>
              </div>
            )}

            {/* Programs */}
            {activePrograms.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4">
                  Programas disponibles
                  <span className="ml-2 text-sm font-medium text-muted-foreground">
                    ({activePrograms.length})
                  </span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {activePrograms.map((program: any) => (
                    <div
                      key={program.id}
                      className="border border-border rounded-xl p-4 bg-card hover:border-primary/30 transition-colors"
                    >
                      <h3 className="font-semibold text-base mb-2">{program.name}</h3>
                      {program.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {program.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {program.schedule && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {program.schedule}
                          </span>
                        )}
                        {(program.age_min !== 0 || program.age_max !== 99) && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {program.age_min}–{program.age_max} años
                          </span>
                        )}
                        {program.price > 0 && (
                          <span className="flex items-center gap-1 text-primary font-semibold">
                            <DollarSign className="w-3 h-3" />
                            ${Number(program.price).toLocaleString('es-CO')} COP
                          </span>
                        )}
                        {program.price === 0 && (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            Gratuito
                          </span>
                        )}
                        {program.spots_available && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {program.spots_available} cupos
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePrograms.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Esta institución aún no tiene programas publicados.</p>
              </div>
            )}
          </div>

          {/* Contact sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 sticky top-24 space-y-4">
              <h3 className="font-bold text-base">Información de contacto</h3>
              <Separator />
              <div className="space-y-3">
                {institution.phone && (
                  <a
                    href={`tel:${institution.phone}`}
                    className="flex items-center gap-3 text-sm group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {institution.phone}
                      </p>
                    </div>
                  </a>
                )}
                {institution.email && (
                  <a
                    href={`mailto:${institution.email}`}
                    className="flex items-center gap-3 text-sm group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[160px]">
                        {institution.email}
                      </p>
                    </div>
                  </a>
                )}
                {institution.website && (
                  <a
                    href={institution.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sitio web</p>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[160px]">
                        {institution.website.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                  </a>
                )}
                {institution.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dirección</p>
                      <p className="font-medium">{institution.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {institution.phone && (
                <Button className="w-full mt-2 bg-primary hover:bg-primary/90" asChild>
                  <a href={`https://wa.me/57${institution.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    Contactar por WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
