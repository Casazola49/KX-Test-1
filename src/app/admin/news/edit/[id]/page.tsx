
import PageTitle from '@/components/shared/PageTitle';
import NewsForm from '@/components/admin/NewsForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';
import type { NewsArticle } from '@/lib/types';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getArticle(id: string): Promise<NewsArticle | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('news')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        
        // Convert HTML content back to plain text for the textarea
        const rawContent = (data.content || '')
          .replace(/<p><\/p>/g, '')         // Remove empty paragraphs
          .replace(/<\/p><p>/g, '\n')    // Replace paragraph breaks with single newlines
          .replace(/<p>/g, '')             // Remove remaining opening <p> tags
          .replace(/<\/p>/g, '')            // Remove remaining closing </p> tags
          .replace(/<br\s*\/?>/g, '\n')   // Convert <br> tags to single newlines
          .trim();

        return {
            ...data,
            content: rawContent, // Ensure the content is plain text for editing
        } as NewsArticle;
    } catch (error) {
        console.error("Error fetching article for editing from Supabase:", error);
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
