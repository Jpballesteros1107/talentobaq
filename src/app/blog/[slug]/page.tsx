import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { supabase } from '@/lib/supabase';

const CATEGORY_LABELS: Record<string, string> = {
  noticia: 'Noticia', evento: 'Evento', consejo: 'Consejo', entrevista: 'Entrevista',
};

async function getPost(slug: string) {
  const { data } = await supabase
    .from('blog_posts')
    .select('*, profiles(full_name)')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  return data;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const p = post as any;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <article className="flex-1">
        {p.image_url && (
          <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden bg-muted">
            <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <Link href="/blog" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Blog
              </Link>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
          {!p.image_url && (
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al blog
            </Link>
          )}

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[p.category] || p.category}</Badge>
            {p.published_at && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(p.published_at).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4">{p.title}</h1>

          {p.profiles?.full_name && (
            <p className="text-sm text-muted-foreground mb-6">Por {p.profiles.full_name}</p>
          )}

          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
            {p.content}
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
}
