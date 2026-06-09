'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function FamilyRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Las contraseñas no coinciden.'); return; }
    if (form.password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres.'); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, phone: form.phone, role: 'public' } },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message === 'User already registered' ? 'Este email ya está registrado.' : 'Error al crear la cuenta.');
      return;
    }

    toast.success('Cuenta creada exitosamente. Bienvenido a TalentoBAQ.');
    router.push('/profile');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="max-w-sm text-white">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
            <span className="text-2xl font-extrabold">TalentoBAQ</span>
          </div>
          <h2 className="text-3xl font-extrabold mb-4 leading-tight">Encuentra el club perfecto</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Crea tu cuenta como familia y busca clubes deportivos, academias de danza,
            teatro y más para tus hijos. Guarda tus favoritos y contacta directamente.
          </p>
          <div className="space-y-3">
            {['Búsqueda con filtros avanzados', 'Guarda instituciones favoritas', 'Contacta directamente por WhatsApp'].map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm text-white/80">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />{b}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Zap className="w-4 h-4 text-primary-foreground" /></div>
            <span className="font-extrabold text-xl text-gradient">TalentoBAQ</span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-extrabold">Registro de familia</h1>
          </div>
          <p className="text-muted-foreground text-sm mb-8">
            ¿Eres una institución?{' '}
            <Link href="/auth/register" className="text-primary font-medium hover:underline">Regístrate aquí</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nombre completo *</Label>
              <Input id="fullName" placeholder="María Fernández" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo *</Label>
              <Input id="email" type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" placeholder="300 000 0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
              <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-semibold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Crear cuenta
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center space-y-2">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Ya tengo cuenta — Iniciar sesión</Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Volver al inicio</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
