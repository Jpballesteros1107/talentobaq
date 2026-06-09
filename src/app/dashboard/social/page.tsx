'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import Header from '@/components/layout/header';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

type SocialRow = { id: string; institution_id: string; platform: string; url: string };

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'website', label: 'Sitio web' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'x', label: 'X (Twitter)' },
];

export default function SocialMediaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState<SocialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [form, setForm] = useState({ platform: 'instagram', url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: inst } = await supabase.from('institutions').select('id').eq('user_id', user!.id).maybeSingle();
      if (!inst) { setLoading(false); return; }
      setInstitutionId(inst.id);
      const { data: sm } = await supabase.from('social_media').select('*').eq('institution_id', inst.id);
      setLinks(sm ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId || !form.url) return;
    setSaving(true);
    const { error } = await supabase.from('social_media').insert({ institution_id: institutionId, platform: form.platform, url: form.url });
    setSaving(false);
    if (error) { toast.error('Error al agregar'); return; }
    const { data } = await supabase.from('social_media').select('*').eq('institution_id', institutionId);
    setLinks(data ?? []);
    setForm({ platform: 'instagram', url: '' });
    toast.success('Red social agregada');
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase.from('social_media').delete().eq('id', id);
    if (error) { toast.error('Error al eliminar'); return; }
    setLinks((prev) => prev.filter((l) => l.id !== id));
    toast.success('Red social eliminada');
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1.5"><Link href="/dashboard"><ArrowLeft className="w-4 h-4" />Volver</Link></Button>
          <h1 className="text-xl font-extrabold">Redes sociales</h1>
        </div>

        {!institutionId ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Primero debes crear tu institución.</p>
            <Button className="mt-4" asChild><Link href="/dashboard/settings">Crear institución</Link></Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add form */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Agregar red social</h2>
              <form onSubmit={addLink} className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-44">
                  <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required className="flex-1 h-10" />
                <Button type="submit" className="bg-primary hover:bg-primary/90 h-10" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} Agregar
                </Button>
              </form>
            </div>

            {/* List */}
            {links.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card text-muted-foreground">
                <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sin redes sociales agregadas.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {links.map((link) => {
                  const platform = PLATFORMS.find((p) => p.value === link.platform);
                  return (
                    <div key={link.id} className="flex items-center justify-between gap-3 p-4 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{platform?.label || link.platform}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[300px]">{link.url}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-destructive" onClick={() => deleteLink(link.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
