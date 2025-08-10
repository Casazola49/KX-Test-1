
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import PageTitle from '@/components/shared/PageTitle';
import ProductDetailClient from '@/components/client/ProductDetailClient';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product:', error.message);
    return null;
  }
  return data as Product;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className={cn("text-white bg-black pattern-bg min-h-screen")}>
      <PageTitle
        title={product.name}
        subtitle={(product as any).summary || "Detalles del Producto"}
        className="font-formula1 text-4xl sm:text-5xl md:text-6xl neon-text-main"
        subtitleClassName="mt-4 text-lg text-gray-300"
      />
      <main className="container mx-auto px-4 py-12">
        <ProductDetailClient product={product} />
      </main>
    </div>
  );
}
