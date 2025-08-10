
import Image from 'next/image';
import Link from 'next/link';
import type { News } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsCardProps {
  news: News;
  isLarge?: boolean;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, isLarge = false, className }) => {
  const formattedDate = new Date((news as any).date || (news as any).created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isLarge) {
    return (
      <Card className={cn("group/mainnews w-full overflow-hidden shadow-xl hover:shadow-primary/30 transition-all duration-300 ease-in-out col-span-1 sm:col-span-2", className)}>
        <Link href={`/noticias/${news.slug}`} className="block">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={(news as any).image_url || (news as any).imageUrl}
              alt={news.title}
              fill
              className="object-cover group-hover/mainnews:scale-105 transition-transform duration-500 ease-in-out"
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
        </Link>
        <CardContent className="p-4 md:p-6 bg-card">
          <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground group-hover/mainnews:text-primary transition-colors duration-300 line-clamp-2 md:line-clamp-3 mb-2">
             <Link href={`/noticias/${news.slug}`}>{news.title}</Link>
          </CardTitle>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 md:line-clamp-3">{(news as any).excerpt || ''}</p>
          <div className="flex items-center text-xs text-muted-foreground mb-4">
            <CalendarDays size={14} className="mr-1.5" />
            {formattedDate}
          </div>
          <Button asChild variant="link" className="p-0 text-primary hover:text-primary/80 font-semibold">
            <Link href={`/noticias/${news.slug}`}>
              Leer más <ArrowRight size={16} className="ml-1 group-hover/mainnews:translate-x-1 transition-transform duration-300" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("group/news w-full overflow-hidden shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-in-out flex flex-col transform hover:-translate-y-1", className)}>
      <Link href={`/noticias/${news.slug}`} className="block">
        <div className="relative aspect-video w-full">
           <Image
            src={(news as any).image_url || (news as any).imageUrl}
            alt={news.title}
            fill
            className="object-cover group-hover/news:scale-105 transition-transform duration-300 ease-in-out"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/news:opacity-100 transition-opacity duration-300 ease-in-out"></div>
        </div>
      </Link>
      <CardHeader className="p-4 flex-grow">
         <CardTitle className="text-base md:text-lg font-semibold line-clamp-2 group-hover/news:text-primary transition-colors duration-300">
          <Link href={`/noticias/${news.slug}`}>{news.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
         <p className="text-muted-foreground text-xs mb-2 line-clamp-2">{news.excerpt}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
         <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays size={12} className="mr-1" />
          {formattedDate}
        </div>
        <Button asChild variant="link" size="sm" className="p-0 text-primary hover:text-primary/80 text-xs font-medium">
          <Link href={`/noticias/${news.slug}`}>
            Ver <ArrowRight size={12} className="ml-0.5 group-hover/news:translate-x-0.5 transition-transform duration-300" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
