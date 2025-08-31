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
  Zap,
  Award,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
                <p className="text-gray-200 text-sm line-clamp-2 leading-relaxed">
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



// --- Componente Principal ---
const allDepartments = ['General', 'Cochabamba', 'Santa Cruz', 'La Paz', 'Chuquisaca', 'Potosi', 'Oruro', 'Tarija'];

export default function EquipamientoServiciosClient({ products }: { products: Product[] }) {
  const [selectedDept, setSelectedDept] = useState('General');
  const [showDepartments, setShowDepartments] = useState(false);

  const handleDeptSelection = (dept: string) => {
    setSelectedDept(dept);
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



  const handleCategorySelect = (category: ProductCategory) => {
    // Convertir nombre de categoría a slug
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
    
    // Construir URL con departamento si no es General
    const departmentParam = selectedDept !== 'General' 
      ? `?departamento=${selectedDept.toLowerCase().replace(/\s+/g, '-')}` 
      : '';
    
    // Redirigir a la página de categoría
    window.location.href = `/equipamiento-servicios/categoria/${categorySlug}${departmentParam}`;
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
            <div className="text-gray-200 font-medium">Productos Totales</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 rounded-lg p-6 border border-yellow-500/30"
          >
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-yellow-500">{productCategories.length}</div>
            <div className="text-gray-200 font-medium">Categorías</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-green-500/20 to-green-500/10 rounded-lg p-6 border border-green-500/30"
          >
            <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-500">
              {products.filter(p => p.is_featured).length}
            </div>
            <div className="text-gray-200 font-medium">Destacados</div>
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

      {/* Vista de Categorías */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {productCategories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={() => handleCategorySelect(category)}
            isSelected={false}
          />
        ))}
      </motion.div>
    </div>
  );
}