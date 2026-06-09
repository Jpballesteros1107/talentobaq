'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Eye, EyeOff, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Header from '@/components/layout/header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { BlogPost } from '@/lib/database.types';

const CATEGORIES = [
  { value: 'noticia', label: 'Noticia' },
  { value: 'evento', label: 'Evento' },
  { value: 'consejo', label: 'Consejo' },
  { value: 'entrevista', label: 'Entrevista' },
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminBlogPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', image_url: '', category: 'noticia', is_published: false });

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) router.push('/');
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;
    async function load() {
      const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      setPosts(data ?? []);
      setLoading(false);
    }
    load();
  }, [user, profile]);

  const openCreate = () => {
    setEditPost(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', image_url: '', category: 'noticia', is_published: false });
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditPost(post);
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt || '', content: post.content || '',
      image_url: post.image_url || '', category: post.category, is_published: post.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const slug = form.slug || slugify(form.title);

    if (editPost) {
      const { error } = await supabase.from('blog_posts').update({
        title: form.title, slug, excerpt: form.excerpt, content: form.content,
        image_url: form.image_url || null, category: form.category, is_published: form.is_published,
        published_at: form.is_published && !editPost.is_published ? new Date().toISOString() : editPost.published_at,
        updated_at: new Date().toISOString(),
      }).eq('id', editPost.id);
      if (error) { toast.error('Error al guardar'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('blog_posts').insert({
        title: form.title, slug, excerpt: form.excerpt, content: form.content,
        image_url: form.image_url || null, category: form.category, is_published: form.is_published,
        author_id: user!.id, published_at: form.is_published ? new Date().toISOString() : null,
      });
      if (error) { toast.error('Error al crear'); setSaving(false); return; }
    }

    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data ?? []);
    setSaving(false);
    setDialogOpen(false);
    toast.success(editPost ? 'Post actualizado' : 'Post creado');
  };

  const togglePublish = async (post: BlogPost) => {
    const is_published = !post.is_published;
    const { error } = await supabase.from('blog_posts').update({
      is_published, published_at: is_published ? new Date().toISOString() : null, updated_at: new Date().toISOString(),
    }).eq('id', post.id);
    if (error) { toast.error('Error'); return; }
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, is_published } : p));
    toast.success(is_published ? 'Post publicado' : 'Post despublicado');
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) { toast.error('Error al eliminar'); return; }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Post eliminado');
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (profile?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="gap-1.5"><Link href="/admin"><ArrowLeft className="w-4 h-4" />Volver</Link></Button>
            <h1 className="text-xl font-extrabold">Blog</h1>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Nuevo post
          </Button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <h3 className="font-semibold text-foreground mb-1">Sin posts</h3>
            <p className="text-sm">Crea tu primer artículo.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold truncate">{post.title}</h3>
                    <Badge variant={post.is_published ? 'default' : 'secondary'} className="text-xs">
                      {post.is_published ? 'Publicado' : 'Borrador'}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">{post.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{post.excerpt || post.slug}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => togglePublish(post)} title={post.is_published ? 'Despublicar' : 'Publicar'}>
                    {post.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(post)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => deletePost(post.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editPost ? 'Editar post' : 'Nuevo post'}</DialogTitle>
            <DialogDescription>{editPost ? 'Modifica el contenido.' : 'Escribe un nuevo artículo para el blog.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5"><Label>Título *</Label><Input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) }); }} placeholder="Mi artículo" required /></div>
            <div className="space-y-1.5"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="mi-articulo" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>URL imagen</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
            </div>
            <div className="space-y-1.5"><Label>Resumen</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Breve resumen del artículo..." /></div>
            <div className="space-y-1.5"><Label>Contenido *</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="Escribe el contenido aquí..." required /></div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div><p className="text-sm font-medium">Publicar</p><p className="text-xs text-muted-foreground">Marca para que sea visible públicamente.</p></div>
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editPost ? 'Guardar' : 'Crear post'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
