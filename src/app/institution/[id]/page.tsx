import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Globe, CheckCircle2, ArrowLeft,
  Calendar, Users, DollarSign, Tag, Clock, Heart, Star,
  ExternalLink, Send, Share2
} from 'lucide-react';
import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
    FaWhatsapp,
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { supabase } from '@/lib/supabase';
import FavoriteButton from '@/components/institutions/favorite-button';
import ReviewSection from '@/components/institutions/review-section';

const COVER_FALLBACKS = [
  'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'website'
  | 'tiktok'
  | 'x'
  | 'whatsapp';

const PLATFORM_ICONS: Record<SocialPlatform, React.ElementType> = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  youtube: FaYoutube,
  website: Globe,
  tiktok: Globe,
  x: Globe,
  whatsapp: FaWhatsapp,
};

const DAY_LABELS: Record<string, string> = {
  lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue',
  viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom',
};

async function getInstitution(id: string) {
  const { data } = await supabase
    .from('institutions')
    .select(`
      *,
      institution_categories(categories(*)),
      programs(*, schedules(*), categories(*)),
      images(*),
      social_media(*),
      reviews(*, profiles(full_name))
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle();
  return data;
}

export default async function InstitutionDetailPage({ params }: { params: { id: string } }) {
  const institution = await getInstitution(params.id);
  if (!institution) notFound();

  const inst = institution as any;
  const categories = inst.institution_categories?.map((ic: any) => ic.categories) ?? [];
  const programs = inst.programs ?? [];
  const activePrograms = programs.filter((p: any) => p.is_active);
  const images = inst.images ?? [];
  const socialLinks = inst.social_media ?? [];
  const reviews = inst.reviews ?? [];

  const coverImg = inst.cover_url || images.find((i: any) => i.is_cover)?.url || COVER_FALLBACKS[inst.id.charCodeAt(0) % COVER_FALLBACKS.length];
  const galleryImages = images.filter((i: any) => !i.is_cover).sort((a: any, b: any) => a.sort_order - b.sort_order);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Cover */}
      <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden bg-muted">
        <img src={coverImg} alt={inst.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <Link href="/explore" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver
          </Link>
          <FavoriteButton institutionId={inst.id} />
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title block */}
            <div>
              <div className="flex items-start gap-3 flex-wrap mb-3">
                <h1 className="text-3xl font-extrabold tracking-tight leading-tight">{inst.name}</h1>
                {inst.verified && <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 mt-1"><CheckCircle2 className="w-3 h-3" /> Verificado</Badge>}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {categories.map((cat: any) => <Badge key={cat.id} variant="secondary" className="text-xs">{cat.name}</Badge>)}
              </div>
              {(inst.neighborhood || inst.address) && (
                <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 shrink-0 text-primary" />
                  {[inst.neighborhood, inst.address].filter(Boolean).join(' — ')}
                </p>
              )}
              {avgRating && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'fill-secondary text-secondary' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{avgRating}</span>
                  <span className="text-xs text-muted-foreground">({reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'})</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            {inst.description && (
              <div>
                <h2 className="text-lg font-bold mb-3">Acerca de la institución</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{inst.description}</p>
              </div>
            )}

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">Galería</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {galleryImages.map((img: any) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
                      <img src={img.url} alt={img.alt_text || inst.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Programs */}
            {activePrograms.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4">Programas disponibles <span className="ml-2 text-sm font-medium text-muted-foreground">({activePrograms.length})</span></h2>
                <div className="space-y-4">
                  {activePrograms.map((program: any) => (
                    <div key={program.id} className="border border-border rounded-xl p-5 bg-card hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                        <h3 className="font-semibold text-base">{program.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {program.categories && <Badge variant="secondary" className="text-xs">{program.categories.name}</Badge>}
                          <Badge variant="outline" className="text-xs capitalize">{program.modality}</Badge>
                          <Badge variant="outline" className="text-xs capitalize">{program.gender}</Badge>
                        </div>
                      </div>
                      {program.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{program.description}</p>}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {(program.age_min !== 0 || program.age_max !== 99) && (
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {program.age_min}–{program.age_max} años</span>
                        )}
                        {program.price > 0 && (
                          <span className="flex items-center gap-1 text-primary font-semibold"><DollarSign className="w-3 h-3" /> ${Number(program.price).toLocaleString('es-CO')} COP</span>
                        )}
                        {program.price === 0 && <span className="flex items-center gap-1 text-emerald-600 font-semibold">Gratuito</span>}
                        {program.spots_available && <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {program.spots_available} cupos</span>}
                      </div>
                      {program.schedules && program.schedules.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Horarios</p>
                          <div className="flex flex-wrap gap-2">
                            {program.schedules.map((s: any) => (
                              <span key={s.id} className="inline-flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1 rounded-full">
                                <Clock className="w-3 h-3 text-primary" />
                                {DAY_LABELS[s.day] || s.day} {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews section with form */}
            <ReviewSection institutionId={inst.id} reviews={reviews} avgRating={avgRating} />

            {/* Map */}
            {(inst.latitude && inst.longitude) && (
              <div>
                <h2 className="text-lg font-bold mb-3">Ubicación</h2>
                <div className="rounded-xl overflow-hidden border border-border bg-muted h-64 flex items-center justify-center">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${inst.longitude - 0.005}%2C${inst.latitude - 0.003}%2C${inst.longitude + 0.005}%2C${inst.latitude + 0.003}&layer=mapnik&marker=${inst.latitude}%2C${inst.longitude}`}
                    className="w-full h-full border-0"
                    loading="lazy"
                    title="Ubicación"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{inst.address}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Contact card */}
            <div className="rounded-2xl border border-border bg-card p-6 sticky top-24 space-y-4">
              <h3 className="font-bold text-base">Información de contacto</h3>
              <Separator />
              <div className="space-y-3">
                {inst.phone && (
                  <a href={`tel:${inst.phone}`} className="flex items-center gap-3 text-sm group">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="font-medium group-hover:text-primary transition-colors">{inst.phone}</p>
                    </div>
                  </a>
                )}
                {inst.email && (
                  <a href={`mailto:${inst.email}`} className="flex items-center gap-3 text-sm group">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium group-hover:text-primary transition-colors truncate max-w-[160px]">{inst.email}</p>
                    </div>
                  </a>
                )}
                {inst.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dirección</p>
                      <p className="font-medium">{inst.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {socialLinks.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Redes sociales</p>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((sm: any) => {
                        const IconComp =  PLATFORM_ICONS[sm.platform as SocialPlatform] || Globe;
                        return (
                          <a key={sm.id} href={sm.url} target="_blank" rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                            <IconComp className="w-4 h-4" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {inst.phone && (
                <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                  <a href={`https://wa.me/57${inst.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 justify-center">
                    <Phone className="w-4 h-4" /> WhatsApp
                  </a>
                </Button>
              )}
            </div>

            {/* Contact form */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-bold text-base mb-1">Enviar mensaje</h3>
              <p className="text-xs text-muted-foreground mb-4">La institución recibirá tu consulta.</p>
              <form action={`/api/contact/${inst.id}`} method="POST" className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="text-xs font-medium">Nombre *</label>
                  <input id="contact-name" name="name" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Tu nombre" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="contact-email" className="text-xs font-medium">Correo *</label>
                  <input id="contact-email" name="email" type="email" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="tu@email.com" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="contact-phone" className="text-xs font-medium">Teléfono</label>
                  <input id="contact-phone" name="phone" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="300 000 0000" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="contact-message" className="text-xs font-medium">Mensaje *</label>
                  <textarea id="contact-message" name="message" required className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" rows={3} placeholder="Hola, me interesa..." />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-sm">
                  <Send className="w-4 h-4 mr-2" /> Enviar mensaje
                </Button>
              </form>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
