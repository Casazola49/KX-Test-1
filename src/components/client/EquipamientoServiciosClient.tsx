'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Product, ProductCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, Variants, useInView } from 'framer-motion';
import Link from 'next/link';
import { 
  ChevronDown, 
  ChevronsRight, 
  Star, 
  ShoppingCart, 
  Eye, 
  Filter,
  Grid3X3,
  List,
  Search,
  Zap,
  Award,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// --- Componentes Animados Reutilizables ---

const FloatingParticles = () => {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      
      const handleResize = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          animate={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
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

const CategoryCard = ({ category, onClick, isSelected }: { 
  category: ProductCategory, 
  onClick: () => void, 
  isSelected: boolean 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <TiltCard>
        <AnimatedBorder className={cn(
          "transition-all duration-300",
          isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-black" : ""
        )}>
          <Card className="bg-gradient-to-br from-gray-900 to-black border-0 overflow-hidden h-80 group">
            <CardHeader className="p-0 relative">
              <div className="relative h-48 w-full overflow-hidden">
                <Image 
                  src={category.image_url} 
                  alt={category.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                {/* Sponsor Level Badge */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center"
                  >
                    <Sparkles className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>

                {/* Product Count */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 border border-primary/30">
                  <span className="text-primary font-bold text-sm">{category.product_count} productos</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold font-formula1 text-primary mb-2 neon-text-subtle">
                  {category.name}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {category.description}
                </p>
              </motion.div>

              {/* Animated Icon */}
              <motion.div
                className="absolute bottom-4 right-4"
                whileHover={{ scale: 1.2, rotate: 15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ChevronsRight className="w-5 h-5 text-primary" />
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </AnimatedBorder>
      </TiltCard>
    </motion.div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ y: -10 }}
      className="h-full"
    >
      <TiltCard>
        <AnimatedBorder>
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
                    className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1"
                  >
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-white fill-white" />
                      <span className="text-white font-bold text-xs">DESTACADO</span>
                    </div>
                  </motion.div>
                )}

                {/* Price */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-primary/30">
                  <span className="text-primary font-bold text-lg">${product.price}</span>
                </div>

                {/* Stock Status */}
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
              </div>
            </CardHeader>
            
            <CardContent className="p-6 flex-grow">
              <AnimatedTitle title={product.name} />
              <p className="text-gray-400 mt-2 text-sm line-clamp-3">{product.summary}</p>
              
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
                
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </AnimatedBorder>
      </TiltCard>
    </motion.div>
  );
};

// --- Componente Principal ---
const allDepartments = ['General', 'Cochabamba', 'Santa Cruz', 'La Paz', 'Chuquisaca', 'Potosi', 'Oruro', 'Tarija'];

export default function EquipamientoServiciosClient({ products }: { products: Product[] }) {
  const [selectedDept, setSelectedDept] = useState('General');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showDepartments, setShowDepartments] = useState(false);
  const [viewMode, setViewMode] = useState<'categories' | 'products'>('categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'featured'>('featured');

  const handleDeptSelection = (dept: string) => {
    setSelectedDept(dept);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setViewMode('categories');
    setShowDepartments(false);
  };

  // Crear categorías dinámicas basadas en los productos
  const productCategories = useMemo(() => {
    const productsInDept = products.filter(p => selectedDept === 'General' || p.department === selectedDept);
    const categoryMap = new Map<string, ProductCategory>();

    productsInDept.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, {
          id: product.category.toLowerCase().replace(/\s+/g, '-'),
          name: product.category,
          slug: product.category.toLowerCase().replace(/\s+/g, '-'),
          description: `Productos de ${product.category.toLowerCase()} de alta calidad`,
          icon: 'default',
          image_url: product.image_url,
          subcategories: [],
          product_count: 0
        });
      }
      
      const category = categoryMap.get(product.category)!;
      category.product_count++;
      
      // Agregar subcategoría si existe
      if (product.subcategory) {
        const existingSubcat = category.subcategories.find(s => s.name === product.subcategory);
        if (!existingSubcat) {
          category.subcategories.push({
            id: `${product.category}-${product.subcategory}`.toLowerCase().replace(/\s+/g, '-'),
            name: product.subcategory,
            slug: product.subcategory.toLowerCase().replace(/\s+/g, '-'),
            description: `${product.subcategory} en ${product.category}`,
            category_id: category.id,
            product_count: 1
          });
        } else {
          existingSubcat.product_count++;
        }
      }
    });

    return Array.from(categoryMap.values());
  }, [products, selectedDept]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => 
      (selectedDept === 'General' || product.department === selectedDept) &&
      (!selectedCategory || product.category === selectedCategory) &&
      (!selectedSubcategory || product.subcategory === selectedSubcategory) &&
      (searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
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
  }, [products, selectedDept, selectedCategory, selectedSubcategory, searchTerm, sortBy]);

  const handleCategorySelect = (category: ProductCategory) => {
    setSelectedCategory(category.name);
    setSelectedSubcategory(null);
    setViewMode('products');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setViewMode('categories');
  };

  const listVariants: Variants = { 
    hidden: { opacity: 0 }, 
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    } 
  };

  return (
    <div className="relative">
      <FloatingParticles />
      
      {/* Header con estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-6 border border-primary/30"
          >
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary">{products.length}</div>
            <div className="text-gray-400">Productos Totales</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 rounded-lg p-6 border border-yellow-500/30"
          >
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-yellow-500">{productCategories.length}</div>
            <div className="text-gray-400">Categorías</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-green-500/20 to-green-500/10 rounded-lg p-6 border border-green-500/30"
          >
            <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-500">
              {products.filter(p => p.is_featured).length}
            </div>
            <div className="text-gray-400">Destacados</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filtros de Departamento */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h3 className="text-3xl font-formula1 font-bold neon-text-subtle mb-6 tracking-widest">
          FILTRAR POR DEPARTAMENTO
        </h3>
        <div className="relative inline-block">
          <Button 
            onClick={() => setShowDepartments(!showDepartments)} 
            className="font-bold text-lg bg-black/50 border-2 border-primary text-primary hover:bg-primary/20 hover:text-white transition-all duration-300 w-72 h-14 neon-pulse-box"
          >
            {selectedDept} 
            <ChevronDown className={cn(
              "ml-4 h-6 w-6 transition-transform duration-300",
              showDepartments ? 'rotate-180' : ''
            )} />
          </Button>
          
          <AnimatePresence>
            {showDepartments && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full mt-2 w-72 bg-black border-2 border-primary/50 rounded-lg shadow-lg z-10 p-2 flex flex-col gap-2 neon-pulse-box"
              >
                {allDepartments.map(dept => (
                  <Button 
                    key={dept} 
                    onClick={() => handleDeptSelection(dept)} 
                    className="w-full justify-center font-bold bg-gray-900/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    {dept}
                  </Button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Barra de búsqueda y controles */}
      <AnimatePresence>
        {viewMode === 'products' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 space-y-4"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <button 
                onClick={handleBackToCategories}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Categorías
              </button>
              <ChevronsRight className="w-4 h-4" />
              <span>{selectedCategory}</span>
              {selectedSubcategory && (
                <>
                  <ChevronsRight className="w-4 h-4" />
                  <span>{selectedSubcategory}</span>
                </>
              )}
            </div>

            {/* Controles */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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

              <div className="text-gray-400">
                {filteredProducts.length} productos encontrados
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vista de Categorías */}
      <AnimatePresence mode="wait">
        {viewMode === 'categories' ? (
          <motion.div
            key="categories"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {productCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => handleCategorySelect(category)}
                isSelected={selectedCategory === category.name}
              />
            ))}
          </motion.div>
        ) : (
          /* Vista de Productos */
          <motion.div
            key="products"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
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
                <p className="text-gray-400">
                  Prueba seleccionando otra categoría o departamento.
                </p>
                <Button 
                  onClick={handleBackToCategories}
                  className="mt-4 bg-primary text-primary-foreground"
                >
                  Volver a Categorías
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}