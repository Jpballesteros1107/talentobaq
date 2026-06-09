import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { supabase } from '@/lib/supabase';

async function getEvents() {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('events')
    .select('*, institutions(name, neighborhood, logo_url)')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(20);
  return data ?? [];
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="border-b border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Eventos</h1>
          <p className="text-muted-foreground text-sm">Torneos, festivales, presentaciones y más en Barranquilla</p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-8 flex-1">
        {events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <h3 className="font-semibold text-foreground mb-1">Sin eventos próximos</h3>
            <p className="text-sm">Las instituciones están preparando nuevos eventos. Vuelve pronto.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((evt: any) => {
              const date = new Date(evt.event_date + 'T12:00:00');
              return (
                <div key={evt.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all group">
                  {evt.image_url && (
                    <div className="h-40 overflow-hidden bg-muted">
                      <img src={evt.image_url} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] text-primary font-bold uppercase">{date.toLocaleDateString('es-CO', { month: 'short' })}</span>
                        <span className="text-base font-extrabold text-primary">{date.getDate()}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base leading-tight line-clamp-2">{evt.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    {evt.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{evt.description}</p>}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                      {evt.start_time && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{evt.start_time.slice(0, 5)}{evt.end_time ? ` - ${evt.end_time.slice(0, 5)}` : ''}</span>
                      )}
                      {evt.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.location}</span>}
                    </div>
                    {evt.institutions && (
                      <Link href={`/institution/${evt.institution_id}`} className="flex items-center gap-2 text-xs text-primary font-medium hover:underline">
                        {evt.institutions.name} <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
