
"use client";

import { useState, useMemo } from 'react';
import { Product } from '@/lib/types';
import Section from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
    >
      <Link href={`/equipamiento-servicios/${product.slug}`} className="block group">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-lg border-2 border-white/10 group-hover:border-primary transition-all duration-300">
          <Image
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            fill
            style={{objectFit: 'cover'}}
            className="transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <div className="w-20 h-20 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-bold">Ver</span>
             </div>
          </div>
        </div>
        <div className="mt-4 text-center">
            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{product.name}</h3>
            <p className="text-sm text-gray-400">{product.category}</p>
        </div>
      </Link>
    </motion.div>
  );
};


interface ProductShowcaseClientProps {
  products: Product[];
}

export default function ProductShowcaseClient({ products }: ProductShowcaseClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const categories = useMemo(() => {
    const allCategories = products.map(p => p.category).filter(Boolean);
    return ['Todas', ...Array.from(new Set(allCategories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Todas') {
      return products;
    }
    return products.filter(p => p.category === selectedCategory);
  }, [selectedCategory, products]);

  return (
    <Section className="py-8 md:py-12 relative overflow-hidden">
        {/* Fondo Decorativo */}
        <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-background" />
            <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-primary/10" />
        </div>
      <motion.div 
        className="flex justify-center flex-wrap gap-3 mb-8 md:mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'secondary'}
            onClick={() => setSelectedCategory(category)}
            className="rounded-full px-6 py-3 text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {category}
          </Button>
        ))}
      </motion.div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 text-lg py-16">
          <p>No hay productos disponibles en esta categoría por el momento.</p>
        </div>
      )}

      <div className="text-center mt-16">
          <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <h3 className="text-2xl font-bold text-white">¿Necesitas Asesoramiento Profesional?</h3>
            <p className="text-gray-400 mt-2">Contacta con nuestros expertos para obtener el mejor rendimiento.</p>
            <Button size="lg" className="mt-6 text-lg rounded-full" asChild>
                <Link href="/equipamiento-servicios/asesoramiento">Asesoramiento Mecánico</Link>
            </Button>
          </motion.div>
      </div>

    </Section>
  );
}
