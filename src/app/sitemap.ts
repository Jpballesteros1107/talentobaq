import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://talentobaq.co';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  // Dynamic institution pages
  try {
    const { data: institutions } = await supabase
      .from('institutions')
      .select('id, updated_at')
      .eq('status', 'approved')
      .limit(50000);

    const institutionPages: MetadataRoute.Sitemap = (institutions || []).map((inst) => ({
      url: `${baseUrl}/institution/${inst.id}`,
      lastModified: new Date(inst.updated_at),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    }));

    return [...staticPages, ...institutionPages];
  } catch {
    return staticPages;
  }
}

