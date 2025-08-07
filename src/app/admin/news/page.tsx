
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import type { NewsArticle } from '@/lib/types';
import NewsListClient from '@/components/admin/NewsListClient';
import { createClient } from '@supabase/supabase-js';

// Usamos la clave de servicio para tener acceso garantizado en el entorno de admin
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

    const articles = data.map(doc => {
        return { 
            ...doc,
            date: new Date(doc.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
        }
    }) as NewsArticle[];
    return articles;
  } catch (error) {
    console.error("Error fetching news for admin from Supabase:", error);
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
