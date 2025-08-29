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
  Heart, 
  Share2, 
  Star, 
  Award, 
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

export default function ProductDetailClient({ product }: { product: Product }) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const images = (product.gallery_images && product.gallery_images.length > 0) 
    ? product.gallery_images 
    : (product.gallery_image_urls && product.gallery_image_urls.length > 0)
    ? product.gallery_image_urls
    : [product.image_url];

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
              {product.price && (
                <span className="text-2xl font-bold text-primary">${product.price}</span>
              )}
              {product.brand && (
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-500 font-semibold">{product.brand}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stock Status */}
          {product.stock !== undefined && product.stock !== null && (
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
          )}

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

          {/* Botones de Contacto */}
          <div className="space-y-4 pt-6 border-t border-gray-700">
            {/* Botones de Acción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Botón WhatsApp */}
              {product.contact_url && (
                <Button
                  asChild
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg transition-all duration-300 transform hover:scale-105 wave-effect"
                >
                  <a 
                    href={product.contact_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Contactar por WhatsApp
                  </a>
                </Button>
              )}

              {/* Botón Sitio Web */}
              {product.website_url && (
                <Button
                  asChild
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold py-3 text-lg transition-all duration-300 transform hover:scale-105 wave-effect"
                >
                  <a 
                    href={product.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visitar Sitio Web
                  </a>
                </Button>
              )}
            </div>

            {/* Botones secundarios */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                  isFavorite && "bg-primary text-primary-foreground"
                )}
              >
                <Heart className={cn("w-5 h-5 mr-2", isFavorite && "fill-current")} />
                {isFavorite ? 'Guardado' : 'Guardar'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartir
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
      {product.specifications && typeof product.specifications === 'object' && Object.keys(product.specifications).length > 0 && (
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