'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/lib/types';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Award, 
  ExternalLink,
  Zap,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeaturedProductsCarouselProps {
  products: Product[];
}

const ProductCarouselCard = ({ product, index }: { product: Product; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) / 10);
    y.set((e.clientY - rect.top - rect.height / 2) / 10);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const getSponsorGlow = (level?: string) => {
    switch (level) {
      case 'PLATINUM':
        return 'shadow-2xl shadow-slate-300/30 ring-2 ring-slate-300/50';
      case 'GOLD':
        return 'shadow-2xl shadow-yellow-400/30 ring-2 ring-yellow-400/50';
      case 'SILVER':
        return 'shadow-xl shadow-gray-400/20 ring-1 ring-gray-400/50';
      case 'BRONZE':
        return 'shadow-xl shadow-orange-400/20 ring-1 ring-orange-400/50';
      default:
        return 'shadow-xl shadow-primary/20';
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateY: 30 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      className="relative w-80 h-96 flex-shrink-0"
    >
      <Card className={cn(
        "relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 border-0 group cursor-pointer",
        getSponsorGlow(product.sponsor_level)
      )}>
        <CardContent className="p-0 h-full">
          {/* Background Image */}
          <div className="relative h-2/3 overflow-hidden">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            {/* Los efectos de sponsor están aplicados pero sin badge visible */}

            {/* Featured Star */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-4 right-4 z-10"
            >
              <div className="bg-primary/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
            </motion.div>

            {/* Price Tag */}
            {product.price && (
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute bottom-4 right-4 z-10"
              >
                <div className="bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-primary/30">
                  <span className="text-white font-bold text-lg">${product.price}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="relative h-1/3 p-6 flex flex-col justify-between">
            <div>
              <motion.h3 
                className="text-xl font-bold text-primary mb-2 line-clamp-2 animated-text-gradient"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {product.name}
              </motion.h3>
              <motion.p 
                className="text-gray-400 text-sm line-clamp-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {product.summary}
              </motion.p>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between mt-4"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-primary font-semibold text-sm">{product.brand}</span>
              </div>
              
              <Button
                asChild
                size="sm"
                className="bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 transition-all duration-300 wave-effect"
              >
                <Link href={`/equipamiento-servicios/${product.slug}`}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Ver
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Animated Border */}
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
            <motion.div
              className="absolute inset-0 border-2 border-primary/30 rounded-lg"
              animate={{
                borderColor: [
                  'rgba(var(--primary), 0.3)',
                  'rgba(var(--primary), 0.8)',
                  'rgba(var(--primary), 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const featuredProducts = products.filter(p => p.is_featured);
  
  if (featuredProducts.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && featuredProducts.length > 1) {
      intervalRef.current = setInterval(nextSlide, 7000); // Cambiar cada 7 segundos
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isAutoPlaying, featuredProducts.length]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Calcular productos visibles (3 a la vez en desktop, 1 en mobile)
  const getVisibleProducts = () => {
    const visibleCount = 3;
    const products = [];
    
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % featuredProducts.length;
      products.push(featuredProducts[index]);
    }
    
    return products;
  };

  const visibleProducts = getVisibleProducts();

  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 particles-bg opacity-30" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-8 h-8 text-primary" />
            </motion.div>
            <h2 className="text-5xl font-bold font-formula1 animated-text-gradient">
              PRODUCTOS DESTACADOS
            </h2>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-8 h-8 text-primary fill-primary" />
            </motion.div>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Los mejores productos de nuestros sponsors premium, seleccionados especialmente para ti
          </p>
        </motion.div>

        {/* Carousel */}
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Buttons */}
          {featuredProducts.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-primary border border-primary/30 backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-primary border border-primary/30 backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Products Container */}
          <div className="flex justify-center items-center gap-8 px-16">
            <AnimatePresence mode="wait">
              {visibleProducts.map((product, index) => (
                <ProductCarouselCard
                  key={`${product.id}-${currentIndex}-${index}`}
                  product={product}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Indicators */}
          {featuredProducts.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    currentIndex === index
                      ? "bg-primary shadow-lg shadow-primary/50"
                      : "bg-gray-600 hover:bg-gray-500"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground font-bold text-lg px-8 py-4 hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 wave-effect"
          >
            <Link href="/equipamiento-servicios">
              Ver Todos los Productos
              <ExternalLink className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}