'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  institutionId: string;
}

export default function FavoriteButton({ institutionId }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('institution_id', institutionId)
      .is('program_id', null)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, institutionId]);

  const toggle = async () => {
    if (!user) {
      toast.error('Inicia sesión para guardar favoritos');
      return;
    }
    setLoading(true);
    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('institution_id', institutionId)
        .is('program_id', null);
      if (error) { toast.error('Error al eliminar'); setLoading(false); return; }
      setIsFavorite(false);
      toast.success('Eliminado de favoritos');
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, institution_id: institutionId, program_id: null });
      if (error) { toast.error('Error al guardar'); setLoading(false); return; }
      setIsFavorite(true);
      toast.success('Agregado a favoritos');
    }
    setLoading(false);
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={toggle}
      disabled={loading}
      className={cn(
        'bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all gap-1.5 text-sm font-medium rounded-full px-3',
        isFavorite ? 'text-red-400 hover:text-red-300' : 'text-white/80 hover:text-white'
      )}
    >
      <Heart className={cn('w-4 h-4 transition-all', isFavorite && 'fill-current')} />
      {isFavorite ? 'Guardado' : 'Guardar'}
    </Button>
  );
}
