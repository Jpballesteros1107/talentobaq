'use client';

import { useState } from 'react';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

interface ReviewSectionProps {
  institutionId: string;
  reviews: Review[];
  avgRating: string | null;
}

export default function ReviewSection({ institutionId, reviews: initialReviews, avgRating: initialAvg }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [avgRating, setAvgRating] = useState(initialAvg);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const userAlreadyReviewed = user ? reviews.some((r: any) => r.user_id === user.id) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Inicia sesión para dejar una opinión'); return; }
    if (rating === 0) { toast.error('Selecciona una calificación'); return; }

    setSubmitting(true);
    const { data, error } = await supabase
      .from('reviews')
      .insert({ institution_id: institutionId, user_id: user.id, rating, comment })
      .select('*, profiles(full_name)')
      .single();

    setSubmitting(false);
    if (error) {
      if (error.code === '23505') toast.error('Ya dejaste una opinión para esta institución');
      else toast.error('Error al enviar opinión');
      return;
    }

    const newReviews = [...reviews, data];
    setReviews(newReviews);
    const newAvg = (newReviews.reduce((s, r) => s + r.rating, 0) / newReviews.length).toFixed(1);
    setAvgRating(newAvg);
    setRating(0);
    setComment('');
    setShowForm(false);
    toast.success('Opinión publicada');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">
          Opiniones <span className="ml-2 text-sm font-medium text-muted-foreground">({reviews.length})</span>
        </h2>
        {user && !userAlreadyReviewed && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> {showForm ? 'Cancelar' : 'Dejar opinión'}
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 p-5 rounded-xl border border-border bg-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Calificación</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setRating(i + 1)} className="p-0.5 transition-transform hover:scale-110">
                    <Star className={cn('w-7 h-7', i < rating ? 'fill-secondary text-secondary' : 'text-muted hover:text-secondary/50')} />
                  </button>
                ))}
                {rating > 0 && <span className="text-sm font-semibold ml-2">{rating}/5</span>}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Comentario (opcional)</p>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comparte tu experiencia..." rows={3} />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Star className="w-4 h-4 mr-2" />}
              Publicar opinión
            </Button>
          </form>
        </div>
      )}

      {reviews.length === 0 && !showForm && (
        <div className="text-center py-8 border border-dashed border-border rounded-xl text-muted-foreground bg-muted/30">
          <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aún no hay opiniones. {user ? 'Sé el primero en dejar la tuya.' : 'Inicia sesión para dejar tu opinión.'}</p>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((review: any) => (
          <div key={review.id} className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {(review.profiles?.full_name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold">{review.profiles?.full_name || 'Usuario'}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('w-3 h-3', i < review.rating ? 'fill-secondary text-secondary' : 'text-muted')} />
                ))}
              </div>
            </div>
            {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
