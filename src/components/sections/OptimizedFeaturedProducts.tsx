'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedFeaturedProductsProps {
  products: Product[];
}

const ProductCard = ({ product }: { product: Product }) => {
  const getSponsorGlow = (level?: string) => {
    switch (level) {
      case 'PLATINUM':
        return 'ring-2 ring-slate-300/50';
      case 'GOLD':
        return 'ring-2 ring-yellow-400/50';
      case 'SILVER':
        return 'ring-1 ring-gray-400/50';
      case 'BRONZE':
        return 'ring-1 ring-orange-400/50';
      default:
        return '';
    }
  };

  return (
    <Card className={cn(
      "relative w-full h-80 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 border-0 group cursor-pointer transition-transform duration-300 hover:scale-105",
      getSponsorGlow(product.sponsor_level)
    )}>
      <CardContent className="p-0 h-full">
        {/* Imagen del producto */}
        <div className="relative h-2/3 overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Estrella destacada */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-primary/90 backdrop-blur-sm rounded-full p-2">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          </div>

          {/* Precio */}
          {product.price && (
            <div className="absolute bottom-4 right-4 z-10">
              <div className="bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white font-bold">${product.price}</span>
              </div>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="relative h-1/3 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {product.summary}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-primary font-semibold text-sm">{product.brand}</span>
            
            <Button
              asChild
              size="sm"
              className="bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 transition-all duration-300"
            >
              <Link href={`/equipamiento-servicios/${product.slug}`}>
                <ExternalLink className="w-3 h-3 mr-1" />
                Ver
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function OptimizedFeaturedProducts({ products }: OptimizedFeaturedProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (products.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  // Mostrar 3 productos a la vez en desktop, 1 en mobile
  const getVisibleProducts = () => {
    const visibleCount = 3;
    const visibleProducts = [];
    
    for (let i = 0; i < Math.min(visibleCount, products.length); i++) {
      const index = (currentIndex + i) % products.length;
      visibleProducts.push(products[index]);
    }
    
    return visibleProducts;
  };

  const visibleProducts = getVisibleProducts();

  return (
    <section className="py-16 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Zap className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold font-f1-bold text-primary">
              PRODUCTOS DESTACADOS
            </h2>
            <Star className="w-6 h-6 text-primary fill-primary" />
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Los mejores productos de nuestros sponsors premium
          </p>
        </div>

        {/* Carrusel */}
        <div className="relative">
          {/* Botones de navegación */}
          {products.length > 3 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-primary border border-primary/30"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-primary border border-primary/30"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Grid de productos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
            {visibleProducts.map((product) => (
              <ProductCard key={`${product.id}-${currentIndex}`} product={product} />
            ))}
          </div>

          {/* Indicadores */}
          {products.length > 3 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(products.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * 3)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    Math.floor(currentIndex / 3) === index
                      ? "bg-primary"
                      : "bg-gray-600 hover:bg-gray-500"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground font-bold px-8 py-3 hover:bg-primary/90 transition-all duration-300"
          >
            <Link href="/equipamiento-servicios">
              Ver Todos los Productos
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}