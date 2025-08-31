
import { notFound } from 'next/navigation';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import PageTitle from '@/components/shared/PageTitle';
import ProductDetailClient from '@/components/client/ProductDetailClient';
import { getProductBySlug } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const product = await getProductBySlug(slug);
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
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
