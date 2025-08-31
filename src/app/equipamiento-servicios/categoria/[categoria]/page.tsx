import { notFound } from 'next/navigation';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import PageTitle from '@/components/shared/PageTitle';
import CategoryProductsClient from '@/components/client/CategoryProductsClient';
import { getAllProducts } from '@/lib/data-service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: {
    categoria: string;
  };
  searchParams: {
    departamento?: string;
  };
}

async function getProductsByCategory(categorySlug: string, department?: string): Promise<{
  products: Product[];
  categoryName: string;
}> {
  try {
    const allProducts = await getAllProducts();
    
    // Convertir slug a nombre de categoría
    const categoryName = categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Filtrar productos por categoría y departamento
    const filteredProducts = allProducts.filter(product => {
      const matchesCategory = product.category.toLowerCase().replace(/\s+/g, '-') === categorySlug;
      const matchesDepartment = !department || department === 'general' || product.department === department;
      return matchesCategory && matchesDepartment;
    });

    // Verificar si la categoría existe
    if (filteredProducts.length === 0) {
      // Buscar si existe algún producto con esta categoría (sin filtro de departamento)
      const categoryExists = allProducts.some(product => 
        product.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
      );
      
      if (!categoryExists) {
        return { products: [], categoryName: '' };
      }
    }

    return {
      products: filteredProducts,
      categoryName: filteredProducts.length > 0 ? filteredProducts[0].category : categoryName
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return { products: [], categoryName: '' };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { products, categoryName } = await getProductsByCategory(
    params.categoria, 
    searchParams.departamento
  );

  if (!categoryName) {
    notFound();
  }

  const departmentName = searchParams.departamento && searchParams.departamento !== 'general' 
    ? searchParams.departamento.charAt(0).toUpperCase() + searchParams.departamento.slice(1)
    : 'General';

  return (
    <div className={cn("text-white bg-black pattern-bg min-h-screen")}>
      <PageTitle
        title={categoryName}
        subtitle={`Productos de ${categoryName.toLowerCase()} ${departmentName !== 'General' ? `en ${departmentName}` : ''}`}
        className="font-formula1 text-4xl sm:text-5xl md:text-6xl neon-text-main"
        subtitleClassName="mt-4 text-lg text-gray-300"
      />
      
      <main className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              asChild 
              className="bg-black/50 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold"
            >
              <Link href="/equipamiento-servicios">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Categorías
              </Link>
            </Button>
            
            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link href="/equipamiento-servicios" className="text-primary hover:text-primary/80 transition-colors">
                Equipamiento y Servicios
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">{categoryName}</span>
              {departmentName !== 'General' && (
                <>
                  <span>/</span>
                  <span>{departmentName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <CategoryProductsClient 
          products={products} 
          categoryName={categoryName}
          currentDepartment={searchParams.departamento || 'general'}
        />
      </main>
    </div>
  );
}