"use client";
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { getNewsBySlugClient } from '@/lib/client-data';
import { News } from '@/lib/types';

import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import AdBanner from '@/components/shared/AdBanner';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewsDetailPage({ params }: { params: { slug: string } }) {
  const [newsItem, setNewsItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Estado para guardar el contenido dividido
  const [splitContent, setSplitContent] = useState<{ part1: string; part2: string | null } | null>(null);

  // Hook para obtener los datos de la noticia
  useEffect(() => {
    async function fetchNews() {
      try {
        const item = await getNewsBySlugClient(params.slug);
        if (item) {
          setNewsItem(item);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching news item:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [params.slug]);

  // Hook para procesar el contenido cuando la noticia se haya cargado
  useEffect(() => {
    if (newsItem?.content) {
      const paragraphs = newsItem.content.split('</p>');
      if (paragraphs.length > 2) {
        const middleIndex = Math.floor(paragraphs.length / 2);
        const part1 = paragraphs.slice(0, middleIndex).join('</p>') + '</p>';
        const part2 = paragraphs.slice(middleIndex).join('</p>');
        setSplitContent({ part1, part2 });
      } else {
        setSplitContent({ part1: newsItem.content, part2: null });
      }
    }
  }, [newsItem]); // Se ejecuta solo cuando newsItem cambia

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return <NewsDetailSkeleton />;
  }

  if (!newsItem) {
    return notFound();
  }

  return (
    <>
      <PageTitle
        title={newsItem.title}
        subtitle={`Publicado el ${new Date((newsItem as any).created_at || (newsItem as any).date).toLocaleDateString()}`}
        showBackButton
      />

      <Section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={(newsItem as any).image_url || (newsItem as any).imageUrl}
              alt={newsItem.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {splitContent ? (
            <div className="prose prose-lg dark:prose-invert max-w-none mx-auto">
              <div dangerouslySetInnerHTML={{ __html: splitContent.part1 }} />

              {splitContent.part2 && (
                <div className="my-8 not-prose">
                  <AdBanner />
                </div>
              )}

              {splitContent.part2 && (
                <div dangerouslySetInnerHTML={{ __html: splitContent.part2 }} />
              )}
            </div>
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none mx-auto"
                 dangerouslySetInnerHTML={{ __html: newsItem.content }}
            />
          )}

          {/* Galería de Imágenes Adicionales */}
          {(((newsItem as any).gallery_image_urls || (newsItem as any).galleryImageUrls) ?? []).length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-4">Galería de Imágenes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {((newsItem as any).gallery_image_urls || (newsItem as any).galleryImageUrls).map((url: string, index: number) => (
                  <div key={index} className="relative aspect-square cursor-pointer overflow-hidden rounded-lg shadow-md" onClick={() => openLightbox(index)}>

                    <Image
                      src={url}
                      alt={`Imagen de la galería ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      <AdBanner />

      {(((newsItem as any).gallery_image_urls || (newsItem as any).galleryImageUrls) ?? []).length > 0 && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={((newsItem as any).gallery_image_urls || (newsItem as any).galleryImageUrls).map((url: string) => ({ src: url }))}
          index={lightboxIndex}
        />
      )}
    </>
  );
}

function NewsDetailSkeleton() {
  return (
    <Section className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
        <Skeleton className="aspect-video w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </Section>
  );
}
