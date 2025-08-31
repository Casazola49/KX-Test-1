'use client';

import { useState, useMemo, useRef } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { motion, useInView, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Star, 
  Eye, 
  Search,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const allDepartments = ['general', 'cochabamba', 'santa-cruz', 'la-paz', 'chuquisaca', 'potosi', 'oruro', 'tarija'];

const departmentLabels: { [key: string]: string } = {
  'general': 'General',
  'cochabamba': 'Cochabamba',
  'santa-cruz': 'Santa Cruz',
  'la-paz': 'La Paz',
  'chuquisaca': 'Chuquisaca',
  'potosi': 'Potosí',
  'oruro': 'Oruro',
  'tarija': 'Tarija'
};

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 350, damping: 40 });
  const ySpring = useSpring(y, { stiffness: 350, damping: 40 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div 
      ref={ref} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave} 
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} 
      className={cn("relative h-full w-full", className)}
    >
       {children}
    </motion.div>
  );
};

const AnimatedBorder = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("relative w-full h-full p-px group", className)}>
    <div className="absolute inset-0 overflow-hidden rounded-lg">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary to-primary/50"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: "conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent)",
        }}
      />
    </div>
    <div className="relative bg-black rounded-lg h-full">
      {children}
    </div>
  </div>
);

const AnimatedTitle = ({ title }: { title: string }) => {
  const letters = Array.from(title);
  const container: Variants = { 
    hidden: { opacity: 0 }, 
    visible: (i = 1) => ({ 
      opacity: 1, 
      transition: { staggerChildren: 0.04, delayChildren: i * 0.05 } 
    }) 
  };
  const child: Variants = { 
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', damping: 12, stiffness: 200 } 
    }, 
    hidden: { opacity: 0, y: 20 } 
  };
  
  return (
    <CardTitle className="text-xl font-bold font-formula1 text-primary neon-text-subtle h-12">
      <motion.div className="flex flex-wrap" variants={container} initial="hidden" animate="visible">
        {letters.map((letter, index) => 
          <motion.span key={index} variants={child}>
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        )}
      </motion.div>
    </CardTitle>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Configuración de efectos por nivel de sponsor
  const getSponsorEffects = (level?: string) => {
    switch (level) {
      case 'PLATINUM':
        return {
          cardClass: 'sponsor-platinum-bg',
          borderClass: 'border-slate-300',
          glowClass: 'shadow-slate-300/30',
          animation: ''
        };
      case 'GOLD':
        return {
          cardClass: 'sponsor-gold-bg',
          borderClass: 'border-yellow-400',
          glowClass: 'shadow-yellow-400/30',
          animation: ''
        };
      case 'SILVER':
        return {
          cardClass: 'sponsor-silver-bg',
          borderClass: 'border-gray-400',
          glowClass: 'shadow-gray-400/20',
          animation: ''
        };
      case 'BRONZE':
        return {
          cardClass: 'sponsor-bronze-bg',
          borderClass: 'border-orange-400',
          glowClass: 'shadow-orange-400/20',
          animation: ''
        };
      default:
        return {
          cardClass: 'sponsor-default-bg',
          borderClass: 'border-primary/30',
          glowClass: '',
          animation: ''
        };
    }
  };

  const sponsorEffects = getSponsorEffects(product.sponsor_level);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className={cn(
        "h-full", 
        sponsorEffects.animation
      )}
    >
      <TiltCard>
        <AnimatedBorder className={cn(
          sponsorEffects.cardClass
        )}>
          <Card className="bg-gradient-to-br from-gray-900 to-black border-0 overflow-hidden h-full flex flex-col group">
            <CardHeader className="p-0 relative">
              <div className="relative h-64 w-full overflow-hidden">
                <Image 
                  src={product.image_url} 
                  alt={product.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Featured Badge */}
                {product.is_featured && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1 animate-bounce"
                  >
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-white fill-white" />
                      <span className="text-white font-bold text-xs">DESTACADO</span>
                    </div>
                  </motion.div>
                )}

                {/* Price */}
                {product.price && (
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-primary/30">
                    <span className="text-primary font-bold text-lg">${product.price}</span>
                  </div>
                )}

                {/* Stock Status */}
                {product.stock !== null && product.stock !== undefined && (
                  <div className="absolute bottom-4 left-4">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      product.stock > 0 
                        ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    )}>
                      {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-6 flex-grow">
              <AnimatedTitle title={product.name} />
              <p className="text-gray-200 mt-2 text-sm line-clamp-3">{product.summary}</p>
              
              {/* Brand */}
              <div className="mt-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-primary font-semibold text-sm">{product.brand}</span>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="p-6 pt-0">
              <div className="w-full space-y-3">
                <Button 
                  asChild 
                  className="w-full bg-primary text-primary-foreground font-bold transition-all duration-300 neon-button transform hover:scale-105"
                >
                  <Link href={`/equipamiento-servicios/${product.slug}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </Link>
                </Button>
                
                {/* Botones de contacto */}
                <div className="grid grid-cols-1 gap-2">
                  {product.contact_url && (
                    <Button 
                      asChild
                      variant="outline" 
                      className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300"
                    >
                      <a href={product.contact_url} target="_blank" rel="noopener noreferrer">
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  
                  {product.website_url && (
                    <Button 
                      asChild
                      variant="outline" 
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      <a href={product.website_url} target="_blank" rel="noopener noreferrer">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Sitio Web
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardFooter>
          </Card>
        </AnimatedBorder>
      </TiltCard>
    </motion.div>
  );
};

interface CategoryProductsClientProps {
  products: Product[];
  categoryName: string;
  currentDepartment: string;
}

export default function CategoryProductsClient({ 
  products, 
  categoryName, 
  currentDepartment 
}: CategoryProductsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'featured'>('featured');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => 
      searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Ordenar productos
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'featured':
        filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return filtered;
  }, [products, searchTerm, sortBy]);

  const handleDepartmentChange = (department: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (department === 'general') {
      params.delete('departamento');
    } else {
      params.set('departamento', department);
    }
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  return (
    <div className="space-y-8">
      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-6 border border-primary/30"
        >
          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-3xl font-bold text-primary text-center">{products.length}</div>
          <div className="text-gray-200 text-center font-medium">Productos Totales</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 rounded-lg p-6 border border-yellow-500/30"
        >
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-3xl font-bold text-yellow-500 text-center">
            {products.filter(p => p.is_featured).length}
          </div>
          <div className="text-gray-200 text-center font-medium">Destacados</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-green-500/20 to-green-500/10 rounded-lg p-6 border border-green-500/30"
        >
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-3xl font-bold text-green-500 text-center">
            {products.filter(p => p.stock && p.stock > 0).length}
          </div>
          <div className="text-gray-200 text-center font-medium">En Stock</div>
        </motion.div>
      </motion.div>

      {/* Filtros y controles */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Filtro de departamento */}
        <div className="flex flex-wrap gap-2">
          <span className="text-gray-200 font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Departamento:
          </span>
          {allDepartments.map(dept => (
            <Button
              key={dept}
              variant={currentDepartment === dept ? "default" : "outline"}
              size="sm"
              onClick={() => handleDepartmentChange(dept)}
              className={cn(
                "transition-all duration-200",
                currentDepartment === dept 
                  ? "bg-primary text-primary-foreground" 
                  : "border-primary/30 text-primary hover:bg-primary/20"
              )}
            >
              {departmentLabels[dept]}
            </Button>
          ))}
        </div>

        {/* Controles de búsqueda y ordenamiento */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/50 border-primary/30 text-white placeholder-gray-400 w-64"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/50 border border-primary/30 text-white rounded-md px-3 py-2"
            >
              <option value="featured">Destacados</option>
              <option value="name">Nombre A-Z</option>
              <option value="price">Precio</option>
            </select>
          </div>

          <div className="text-gray-200 font-medium">
            {filteredProducts.length} productos encontrados
          </div>
        </div>
      </motion.div>

      {/* Grid de productos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="col-span-full text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-3xl text-gray-600 font-formula1 tracking-widest mb-2">
              No hay productos disponibles
            </p>
            <p className="text-gray-200">
              Prueba cambiando los filtros de búsqueda o departamento.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}