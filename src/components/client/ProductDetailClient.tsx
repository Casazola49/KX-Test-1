'use client';

import { useState, useRef } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Award, 
  Package, 
  Truck, 
  Shield, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 350, damping: 40 });
  const ySpring = useSpring(y, { stiffness: 350, damping: 40 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ['-5deg', '5deg']);

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

const ImageGallery = ({ images, productName }: { images: string[], productName: string }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Imagen Principal */}
      <motion.div 
        className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-primary/30"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={images[currentImage]}
          alt={productName}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
        />
        
        {/* Controles de navegación */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={prevImage}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={nextImage}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Indicador de zoom */}
        <div className="absolute top-4 right-4 bg-black/70 rounded-full p-2">
          <Eye className="w-4 h-4 text-primary" />
        </div>

        {/* Contador de imágenes */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-full px-3 py-1">
            <span className="text-white text-sm">
              {currentImage + 1} / {images.length}
            </span>
          </div>
        )}
      </motion.div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <motion.button
              key={index}
              className={cn(
                "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0",
                currentImage === index 
                  ? "border-primary shadow-lg shadow-primary/25" 
                  : "border-gray-600 hover:border-primary/50"
              )}
              onClick={() => setCurrentImage(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                fill
                className="object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

const SpecificationCard = ({ title, specs }: { title: string, specs: { [key: string]: string } }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-black border border-primary/30">
        <CardHeader>
          <h3 className="text-xl font-bold text-primary flex items-center gap-2">
            <Info className="w-5 h-5" />
            {title}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                <span className="text-gray-400 font-medium">{key}:</span>
                <span className="text-white font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const SponsorBadge = ({ level }: { level: string }) => {
  const colors = {
    PLATINUM: 'from-gray-300 to-gray-100 text-gray-800',
    GOLD: 'from-yellow-400 to-yellow-200 text-yellow-800',
    SILVER: 'from-gray-400 to-gray-200 text-gray-800',
    BRONZE: 'from-orange-400 to-orange-200 text-orange-800'
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r font-bold text-sm",
        colors[level as keyof typeof colors] || colors.BRONZE
      )}
    >
      <Award className="w-4 h-4" />
      SPONSOR {level}
    </motion.div>
  );
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const images = product.gallery_images && product.gallery_images.length > 0 
    ? product.gallery_images 
    : [product.image_url];

  const handleAddToCart = () => {
    // Implementar lógica del carrito
    console.log(`Agregando ${quantity} unidades de ${product.name} al carrito`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.summary,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Button variant="ghost" asChild className="text-primary hover:text-primary/80">
          <Link href="/equipamiento-servicios">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Equipamiento
          </Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Galería de Imágenes */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <TiltCard>
            <ImageGallery images={images} productName={product.name} />
          </TiltCard>
        </motion.div>

        {/* Información del Producto */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline" className="border-primary text-primary">
                {product.category}
              </Badge>
              {product.subcategory && (
                <Badge variant="secondary">
                  {product.subcategory}
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Destacado
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold font-formula1 text-primary neon-text-subtle mb-2">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold text-primary">${product.price}</span>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-500 font-semibold">{product.brand}</span>
              </div>
            </div>

            {product.sponsor_level && (
              <div className="mb-4">
                <SponsorBadge level={product.sponsor_level} />
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-500 font-semibold">
                  {product.stock} unidades disponibles
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-500 font-semibold">Sin stock</span>
              </>
            )}
          </div>

          {/* Descripción */}
          <div>
            <p className="text-gray-300 text-lg leading-relaxed">
              {product.summary}
            </p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Características:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-primary/50 text-primary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Controles de Compra */}
          <div className="space-y-4 pt-6 border-t border-gray-700">
            {/* Cantidad */}
            <div className="flex items-center gap-4">
              <label className="text-gray-300 font-medium">Cantidad:</label>
              <div className="flex items-center border border-primary/30 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-primary hover:bg-primary/20"
                >
                  -
                </Button>
                <span className="px-4 py-2 text-white font-semibold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="text-primary hover:bg-primary/20"
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-primary text-primary-foreground font-bold py-3 text-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                  isFavorite && "bg-primary text-primary-foreground"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Información de Envío */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Truck className="w-4 h-4 text-primary" />
                <span>Envío gratis</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-primary" />
                <span>Garantía incluida</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-primary" />
                <span>Entrega rápida</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Especificaciones */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <SpecificationCard 
          title="Especificaciones Técnicas" 
          specs={product.specifications} 
        />
      )}

      {/* Descripción Detallada */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12"
      >
        <Card className="bg-gradient-to-br from-gray-900 to-black border border-primary/30">
          <CardHeader>
            <h3 className="text-2xl font-bold text-primary">Descripción Detallada</h3>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}