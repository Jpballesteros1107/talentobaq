import Link from 'next/link';
import { ArrowRight, Search, Users, Star, TrendingUp, Shield, Music, MapPin, CheckCircle2, Heart, Zap, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { supabase } from '@/lib/supabase';

async function getHomeData() {
  const [instRes, catRes] = await Promise.all([
    supabase.from('institutions').select('id, name, neighborhood, cover_url, verified, description').eq('status', 'approved').eq('verified', true).limit(6),
    supabase.from('categories').select('*').order('sort_order'),
  ]);
  return {
    featured: instRes.data ?? [],
    categories: catRes.data ?? [],
  };
}

const CATEGORY_ICONS: Record<string, string> = {
  'Fútbol': '⚽', 'Baloncesto': '🏀', 'Natación': '🏊', 'Atletismo': '🏃',
  'Artes Marciales': '🥋', 'Voleibol': '🏐', 'Danza': '💃', 'Teatro': '🎭',
  'Canto': '🎤', 'Música': '🎵', 'Artes Plásticas': '🎨', 'Fotografía': '📸',
};

const COVER_FALLBACKS = [
  'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const TESTIMONIALS = [
  { name: 'María Fernández', role: 'Madre de familia', text: 'Encontré la academia de danza perfecta para mi hija en minutos. Antes tardaba semanas preguntando por WhatsApp.' },
  { name: 'Carlos Pérez', role: 'Joven deportista', text: 'Gracias a TalentoBAQ encontré un club de fútbol cerca de mi barrio. Ahora entreno tres veces por semana.' },
  { name: 'Ana Gómez', role: 'Directora de academia', text: 'Desde que registramos nuestra academia, recibimos el triple de consultas. La plataforma es increíble.' },
];

export default async function HomePage() {
  const { featured, categories } = await getHomeData();
  const sportCategories = categories.filter((c) => c.type === 'sport');
  const cultureCategories = categories.filter((c) => c.type === 'culture');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[640px] flex items-center overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-15" />
        <div className="relative container mx-auto px-4 lg:px-8 py-20 z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-3 py-1.5 rounded-full border border-white/20 mb-6">
              <MapPin className="w-3.5 h-3.5" />
              Barranquilla, Colombia
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5">
              Descubre tu <br />
              <span className="text-secondary">pasión</span> en BAQ
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
              Explora clubes deportivos, academias de danza, teatro, música y más.
              Encuentra tu lugar y desarrolla tu talento en Barranquilla.
            </p>

            {/* Search bar */}
            <div className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <form action="/explore" className="w-full">
                  <Input
                    name="search"
                    placeholder="Buscar fútbol, danza, teatro..."
                    className="pl-9 h-12 bg-white/95 text-foreground border-0 rounded-xl shadow-lg"
                  />
                </form>
              </div>
              <Button size="lg" className="h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold rounded-xl shadow-lg px-6" asChild>
                <Link href="/explore">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Link>
              </Button>
            </div>

            {/* Quick category pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/explore?category=${cat.id}`}
                  className="bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                >
                  {CATEGORY_ICONS[cat.name] || '⭐'} {cat.name}
                </Link>
              ))}
              <Link
                href="/explore"
                className="bg-secondary/80 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-secondary transition-colors"
              >
                Ver todos
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10">
          <div className="container mx-auto px-4 lg:px-8 py-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{featured.length}+</p>
              <p className="text-xs text-white/70 font-medium">Instituciones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{categories.length}</p>
              <p className="text-xs text-white/70 font-medium">Categorías</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-secondary">100%</p>
              <p className="text-xs text-white/70 font-medium">Verificadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">
              ¿Qué quieres practicar?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Desde deportes hasta artes escénicas, encuentra la actividad que te apasiona.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="font-bold text-base">Deportes</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {sportCategories.map((cat) => (
                <Link key={cat.id} href={`/explore?category=${cat.id}`} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group">
                  <span className="text-3xl">{CATEGORY_ICONS[cat.name] || '🏃'}</span>
                  <span className="text-xs font-semibold text-center text-muted-foreground group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-secondary rounded-full" />
              <h3 className="font-bold text-base">Cultura y Artes</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {cultureCategories.map((cat) => (
                <Link key={cat.id} href={`/explore?category=${cat.id}`} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-secondary/40 hover:bg-secondary/5 transition-all group">
                  <span className="text-3xl">{CATEGORY_ICONS[cat.name] || '🎨'}</span>
                  <span className="text-xs font-semibold text-center text-muted-foreground group-hover:text-secondary transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured institutions */}
      {featured.length > 0 && (
        <section className="py-16 bg-muted/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-1">Instituciones destacadas</h2>
                <p className="text-muted-foreground text-sm">Clubes y academias verificadas de Barranquilla</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/explore">Ver todas <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((inst, i) => (
                <Link key={inst.id} href={`/institution/${inst.id}`} className="group block">
                  <div className="rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg transition-all group-hover:-translate-y-0.5">
                    <div className="relative h-44 bg-muted overflow-hidden">
                      <img
                        src={inst.cover_url || COVER_FALLBACKS[i % COVER_FALLBACKS.length]}
                        alt={inst.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {inst.verified && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                          <CheckCircle2 className="w-3 h-3" /> Verificado
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{inst.name}</h3>
                      {inst.neighborhood && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" /> {inst.neighborhood}
                        </p>
                      )}
                      {inst.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{inst.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">¿Por qué usar TalentoBAQ?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Beneficios para familias e instituciones</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="w-6 h-6" />, title: 'Instituciones verificadas', desc: 'Cada club y academia pasa por un proceso de verificación para garantizar calidad y seguridad.' },
              { icon: <Search className="w-6 h-6" />, title: 'Búsqueda inteligente', desc: 'Filtra por categoría, edad, precio, modalidad y ubicación. Encuentra exactamente lo que buscas.' },
              { icon: <Heart className="w-6 h-6" />, title: 'Guarda tus favoritos', desc: 'Marca las instituciones y programas que te interesan y revisalos cuando quieras.' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">¿Cómo funciona?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: <Search className="w-6 h-6" />, title: 'Explora', desc: 'Busca por deporte, arte, barrio o precio. Usa los filtros para encontrar exactamente lo que necesitas.' },
              { step: '02', icon: <Star className="w-6 h-6" />, title: 'Compara', desc: 'Revisa programas, horarios, precios y opiniones. Guarda tus favoritos para decidir después.' },
              { step: '03', icon: <Users className="w-6 h-6" />, title: 'Contacta', desc: 'Comunícate directamente con la institución y comienza tu aventura deportiva o cultural.' },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl border border-border bg-card">
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{item.step}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for institutions */}
      <section className="py-16 gradient-hero">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">¿Tienes una institución?</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Registra tu club, academia o grupo cultural y conéctate con cientos de jóvenes que buscan tu actividad.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" asChild>
              <Link href="/auth/register">Registrar mi institución <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold" asChild>
              <Link href="/auth/family-register">Registrar como familia</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
