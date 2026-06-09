import Link from 'next/link';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { supabase } from '@/lib/supabase';

async function getPosts() {
  const { data } = await supabase
    .from('blog_posts')
    .select('*, profiles(full_name)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(12);
  return data ?? [];
}

const CATEGORY_LABELS: Record<string, string> = {
  noticia: 'Noticia', evento: 'Evento', consejo: 'Consejo', entrevista: 'Entrevista',
};

const CATEGORY_COLORS: Record<string, string> = {
  noticia: 'bg-primary/10 text-primary', evento: 'bg-secondary/10 text-secondary',
  consejo: 'bg-emerald-100 text-emerald-700', entrevista: 'bg-amber-100 text-amber-700',
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="border-b border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Blog</h1>
          <p className="text-muted-foreground text-sm">Noticias, consejos y entrevistas del mundo deportivo y cultural en Barranquilla</p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-8 flex-1">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <h3 className="font-semibold text-foreground mb-1">Próximamente</h3>
            <p className="text-sm">Estamos preparando contenido para ti.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <article className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all h-full">
                  {post.image_url && (
                    <div className="h-44 overflow-hidden bg-muted">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category] || 'bg-muted text-muted-foreground'}`}>
                        {CATEGORY_LABELS[post.category] || post.category}
                      </span>
                      {post.published_at && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.published_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                    {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                    {post.profiles?.full_name && (
                      <p className="text-xs text-muted-foreground mt-3">Por {post.profiles.full_name}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
