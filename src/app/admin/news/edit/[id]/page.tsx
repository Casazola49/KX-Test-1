
import PageTitle from '@/components/shared/PageTitle';
import NewsForm from '@/components/admin/NewsForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';
import type { NewsArticle } from '@/lib/types';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getAllNews } from '@/lib/data-service';

async function getArticle(id: string): Promise<NewsArticle | null> {
    try {
        // Get all news and find by id
        const allNews = await getAllNews();
        const article = allNews.find(item => item.id === id);
        
        if (!article) return null;
        
        // Convert HTML content back to plain text for the textarea
        const rawContent = (article.content || '')
          .replace(/<p><\/p>/g, '')         // Remove empty paragraphs
          .replace(/<\/p><p>/g, '\n')    // Replace paragraph breaks with single newlines
          .replace(/<p>/g, '')             // Remove remaining opening <p> tags
          .replace(/<\/p>/g, '')            // Remove remaining closing </p> tags
          .replace(/<br\s*\/?>/g, '\n')   // Convert <br> tags to single newlines
          .trim();

        return {
            ...article,
            content: rawContent, // Ensure the content is plain text for editing
        } as NewsArticle;
    } catch (error) {
        console.error("Error fetching article for editing from Firebase:", error);
        return null;
    }
}

export default async function EditNewsPage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Editar Noticia" />
      <Section className="py-8 md:py-12">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Editando: {article.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <NewsForm article={article} />
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
