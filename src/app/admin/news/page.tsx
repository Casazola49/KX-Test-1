
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import type { NewsArticle } from '@/lib/types';
import NewsListClient from '@/components/admin/NewsListClient';
import { getAllNews } from '@/lib/data-service';

async function getNews() {
  try {
    const articles = await getAllNews();
    return articles.map(article => ({
      ...article,
      date: article.createdAt ? new Date(article.createdAt).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : 'Sin fecha'
    })) as NewsArticle[];
  } catch (error) {
    console.error("Error fetching news for admin from Firebase:", error);
    return [];
  }
}

export default async function NewsListPage() {
    const articles = await getNews();

    return (
        <>
            <PageTitle title="Panel de Administración" subtitle="Gestionar Noticias" />
            <Section>
                <NewsListClient articles={articles} />
            </Section>
        </>
    )
}
