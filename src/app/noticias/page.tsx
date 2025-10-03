
// Migrado a Firebase - Ya no usa Supabase
import NewsSection from '@/components/sections/NewsSection';
import PageTitle from '@/components/shared/PageTitle';
import HorizontalAd from '@/components/shared/HorizontalAd';
import type { News } from '@/lib/types';
import { getAllNews } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

async function getNews() {
  try {
    return await getAllNews();
  } catch (error) {
    console.error("Error fetching news from Firebase:", error);
    return [];
  }
}

export default async function NoticiasPage() {
  const articles = await getNews();

  return (
    <>
      <PageTitle title="Noticias" subtitle="KartXperience Bolivia" />
      <NewsSection condensed={false} showTitle={false} news={articles as unknown as News[]} />
      <HorizontalAd section="noticias" />
    </>
  );
}
