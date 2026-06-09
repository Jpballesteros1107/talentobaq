'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Heart, Settings, LogOut, Loader2, MapPin, Star, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { Institution, Category } from '@/lib/database.types';

type FavoriteInstitution = Institution & {
  institution_categories: Array<{ categories: Category }>;
};

export default function ProfilePage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      if (profile) setForm({ fullName: profile.full_name, phone: profile.phone || '' });

      const { data } = await supabase
        .from('favorites')
        .select('institution_id, institutions(*, institution_categories(categories(*)))')
        .eq('user_id', user!.id)
        .is('program_id', null);
      const favs = (data ?? []).map((f: any) => f.institutions).filter(Boolean);
      setFavorites(favs as any);
      setLoading(false);
    }
    load();
  }, [user, profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.fullName, phone: form.phone })
      .eq('id', user!.id);
    setSaving(false);
    if (error) { toast.error('Error al guardar'); return; }
    toast.success('Perfil actualizado');
  };

  const removeFavorite = async (institutionId: string) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user!.id)
      .eq('institution_id', institutionId);
    if (error) { toast.error('Error al eliminar'); return; }
    setFavorites((prev) => prev.filter((f) => f.id !== institutionId));
    toast.success('Eliminado de favoritos');
  };

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pw = fd.get('password') as string;
    if (pw.length < 6) { toast.error('Mínimo 6 caracteres'); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error('Error al cambiar contraseña'); return; }
    toast.success('Contraseña actualizada');
    (e.target as HTMLFormElement).reset();
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Mi perfil</h1>
            <p className="text-sm text-muted-foreground">{profile?.role === 'institution' ? 'Institución' : profile?.role === 'admin' ? 'Administrador' : 'Familia'}</p>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info" className="gap-2"><User className="w-4 h-4" /> Información</TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2"><Heart className="w-4 h-4" /> Favoritos</TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Settings className="w-4 h-4" /> Seguridad</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card className="max-w-lg">
              <CardContent className="p-6">
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Nombre completo</Label>
                    <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="300 000 0000" />
                  </div>
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Guardar cambios
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            {favorites.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border max-w-lg">
                <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <h3 className="font-semibold text-foreground mb-1">Sin favoritos</h3>
                <p className="text-sm mb-4">Explora instituciones y guarda las que te interesen.</p>
                <Button asChild><Link href="/explore">Explorar</Link></Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
                {favorites.map((inst) => {
                  const cats = inst.institution_categories?.map((ic: any) => ic.categories) ?? [];
                  return (
                    <div key={inst.id} className="bg-card rounded-xl border border-border p-4 relative group">
                      <button onClick={() => removeFavorite(inst.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <Link href={`/institution/${inst.id}`} className="block">
                        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{inst.name}</h3>
                        {inst.neighborhood && <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><MapPin className="w-3 h-3" />{inst.neighborhood}</p>}
                        <div className="flex flex-wrap gap-1">
                          {cats.slice(0, 3).map((cat: any) => (
                            <Badge key={cat?.id} variant="secondary" className="text-xs">{cat?.name}</Badge>
                          ))}
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="security">
            <Card className="max-w-lg">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Cambiar contraseña</h3>
                <form onSubmit={changePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
                  </div>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Actualizar contraseña</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
