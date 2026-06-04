import Link from 'next/link';
import { ArrowRight, Search, Users, Star, TrendingUp, Shield, Music, Goal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { supabase } from '@/lib/supabase';

async function getStats() {
  const [institutions, categories] = await Promise.all([
    supabase.from('institutions').select('id', { count: 'exact' }).eq('status', 'approved'),
    supabase.from('categories').select('*').order('sort_order'),
  ]);
  return {
    institutionCount: institutions.count ?? 0,
    categories: categories.data ?? [],
  };
}

const CATEGORY_ICONS: Record<string, string> = {
  'Fútbol': '⚽',
  'Baloncesto': '🏀',
  'Natación': '🏊',
  'Atletismo': '🏃',
  'Artes Marciales': '🥋',
  'Voleibol': '🏐',
  'Danza': '💃',
  'Teatro': '🎭',
  'Canto': '🎤',
  'Música': '🎵',
  'Artes Plásticas': '🎨',
  'Fotografía': '📸',
};

const HERO_COVER = 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1600';
const CULTURE_IMG = 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800';
const SPORT_IMG = 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800';

export default async function HomePage() {
  const { institutionCount, categories } = await getStats();
  const sportCategories = categories.filter((c) => c.type === 'sport');
  const cultureCategories = categories.filter((c) => c.type === 'culture');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden gradient-hero">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${HERO_COVER})` }}
        />
        <div className="relative container mx-auto px-4 lg:px-8 py-20 z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-3 py-1.5 rounded-full border border-white/20 mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-base shadow-lg" asChild>
                <Link href="/explore">
                  <Search className="w-4 h-4 mr-2" />
                  Explorar instituciones
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold text-base" asChild>
                <Link href="/auth/register">
                  Registrar mi institución
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10">
          <div className="container mx-auto px-4 lg:px-8 py-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{institutionCount}+</p>
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

          {/* Sports */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="font-bold text-base text-foreground">Deportes</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {sportCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/explore?category=${cat.id}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <span className="text-3xl">{CATEGORY_ICONS[cat.name] || '🏃'}</span>
                  <span className="text-xs font-semibold text-center text-muted-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Culture */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-secondary rounded-full" />
              <h3 className="font-bold text-base text-foreground">Cultura y Artes</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {cultureCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/explore?category=${cat.id}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-secondary/40 hover:bg-secondary/5 transition-all group"
                >
                  <span className="text-3xl">{CATEGORY_ICONS[cat.name] || '🎨'}</span>
                  <span className="text-xs font-semibold text-center text-muted-foreground group-hover:text-secondary transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature sections */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4">
                <Shield className="w-3.5 h-3.5" />
                Instituciones verificadas
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">
                Sólo los mejores clubes deportivos
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Cada institución pasa por un proceso de verificación para garantizar que ofrezca
                actividades de calidad. Encuéntrate con entrenadores y artistas profesionales
                de Barranquilla.
              </p>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
                <Link href="/explore?type=sport">
                  Ver deportes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src={SPORT_IMG} alt="Deportes" className="w-full h-64 object-cover" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-last md:order-first rounded-2xl overflow-hidden shadow-xl">
              <img src={CULTURE_IMG} alt="Cultura" className="w-full h-64 object-cover" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary/20 text-amber-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
                <Music className="w-3.5 h-3.5" />
                Arte y Cultura
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">
                Danza, teatro, canto y mucho más
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Barranquilla tiene una rica tradición cultural. Explora academias de danza,
                compañías de teatro, escuelas de canto y agrupaciones musicales que te
                esperan para desarrollar tu talento artístico.
              </p>
              <Button asChild variant="outline" className="border-secondary text-amber-700 hover:bg-secondary/10">
                <Link href="/explore?type=culture">
                  Ver cultura
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">¿Cómo funciona?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Conectar con tu club favorito es muy fácil.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <Search className="w-6 h-6" />,
                title: 'Explora',
                desc: 'Navega por nuestra lista de instituciones y usa los filtros para encontrar exactamente lo que buscas.',
              },
              {
                step: '02',
                icon: <Star className="w-6 h-6" />,
                title: 'Descubre programas',
                desc: 'Revisa los programas disponibles, horarios, rangos de edad y precios de cada institución.',
              },
              {
                step: '03',
                icon: <Users className="w-6 h-6" />,
                title: 'Contacta',
                desc: 'Comunícate directamente con la institución para inscribirte y empezar tu aventura.',
              },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl border border-border bg-card">
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{item.step}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for institutions */}
      <section className="py-16 gradient-hero">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            ¿Tienes una institución?
          </h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Registra tu club, academia o grupo cultural y conéctate con cientos de jóvenes
            que buscan tu actividad.
          </p>
          <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" asChild>
            <Link href="/auth/register">
              Registrar mi institución
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
