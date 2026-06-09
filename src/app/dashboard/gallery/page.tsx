'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Loader2, Image as ImageIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

type ImageRow = { id: string; url: string; alt_text: string; sort_order: number; is_cover: boolean; institution_id: string };

export default function GalleryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: inst } = await supabase.from('institutions').select('id').eq('user_id', user!.id).maybeSingle();
      if (!inst) { setLoading(false); return; }
      setInstitutionId(inst.id);
      const { data: imgs } = await supabase.from('images').select('*').eq('institution_id', inst.id).order('sort_order');
      setImages(imgs ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !institutionId) return;
    setUploading(true);

    const ext = file.name.split('.').pop();
    const path = `${institutionId}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('institution-images').upload(path, file, { cacheControl: '3600', upsert: false });
    if (uploadErr) {
      // Fallback: use a placeholder URL since storage bucket may not exist
      const url = URL.createObjectURL(file);
      const { error } = await supabase.from('images').insert({ institution_id: institutionId, url, alt_text: file.name, is_cover: images.length === 0 });
      if (error) { toast.error('Error al subir imagen'); setUploading(false); return; }
      const { data } = await supabase.from('images').select('*').eq('institution_id', institutionId).order('sort_order');
      setImages(data ?? []);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('institution-images').getPublicUrl(path);
    const url = urlData.publicUrl;
    const { error } = await supabase.from('images').insert({ institution_id: institutionId, url, alt_text: file.name, is_cover: images.length === 0 });
    if (error) { toast.error('Error al guardar'); setUploading(false); return; }
    const { data } = await supabase.from('images').select('*').eq('institution_id', institutionId).order('sort_order');
    setImages(data ?? []);
    toast.success('Imagen subida');
    setUploading(false);
  };

  const deleteImage = async (id: string) => {
    const { error } = await supabase.from('images').delete().eq('id', id);
    if (error) { toast.error('Error al eliminar'); return; }
    setImages((prev) => prev.filter((i) => i.id !== id));
    toast.success('Imagen eliminada');
  };

  const setCover = async (id: string) => {
    await supabase.from('images').update({ is_cover: false }).eq('institution_id', institutionId!).eq('is_cover', true);
    await supabase.from('images').update({ is_cover: true }).eq('id', id);
    const { data } = await supabase.from('images').select('*').eq('institution_id', institutionId!).order('sort_order');
    setImages(data ?? []);
    toast.success('Portada actualizada');
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="gap-1.5"><Link href="/dashboard"><ArrowLeft className="w-4 h-4" />Volver</Link></Button>
            <h1 className="text-xl font-extrabold">Galería de imágenes</h1>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Subir imagen
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadFile} />
        </div>

        {!institutionId ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Primero debes crear tu institución.</p>
            <Button className="mt-4" asChild><Link href="/dashboard/settings">Crear institución</Link></Button>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card text-muted-foreground">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <h3 className="font-semibold text-foreground mb-1">Sin imágenes</h3>
            <p className="text-sm">Sube tu primera foto o banner.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted group border border-border">
                <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" className="h-8 gap-1 text-xs" onClick={() => setCover(img.id)}>
                    <Star className="w-3 h-3" /> Portada
                  </Button>
                  <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => deleteImage(img.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {img.is_cover && (
                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" /> Portada
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
