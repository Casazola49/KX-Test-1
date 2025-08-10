
import NewsSection from '@/components/sections/NewsSection';
import PageTitle from '@/components/shared/PageTitle';
import AdBanner from '@/components/shared/AdBanner';
import type { News } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Using admin client to bypass RLS for this public page
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getNews() {
  try {
    const { data, error } = await supabaseAdmin
      .from('news')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data as any[]) || [];
  } catch (error) {
    console.error("Error fetching news from Supabase:", error);
    return [];
  }
}

export default async function NoticiasPage() {
  const articles = await getNews();

  return (
    <>
      <PageTitle title="Noticias" subtitle="KartXperience Bolivia" />
      <NewsSection condensed={false} showTitle={false} news={articles as unknown as News[]} />
      <AdBanner />
    </>
  );
}
