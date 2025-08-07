
'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PhoneOutgoing } from 'lucide-react';

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const allImages = [product.image_url, ...(product.gallery_image_urls || [])].filter(Boolean) as string[];
  const [mainImage, setMainImage] = useState(allImages[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Image Gallery */}
      <div className="flex flex-col gap-4">
        <motion.div 
          key={mainImage}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-primary/30 neon-pulse-box"
        >
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover"
          />
        </motion.div>
        <div className="grid grid-cols-4 gap-4">
          {allImages.map((image, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMainImage(image)}
              className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-colors duration-200 ${mainImage === image ? 'border-primary' : 'border-transparent'}`}
            >
              <Image
                src={image}
                alt={`${product.name} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-formula1 font-bold text-primary neon-text-subtle mb-2">{product.brand || 'Marca Genérica'}</h2>
          <p className="text-lg text-gray-300">{product.description || 'No hay descripción detallada disponible para este producto.'}</p>
        </div>
        
        {product.specifications && (
          <div>
            <h3 className="text-2xl font-formula1 neon-text-subtle mb-4">Especificaciones</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              {Object.entries(product.specifications).map(([key, value]) => (
                <li key={key}><span className="font-bold text-gray-200">{key}:</span> {value}</li>
              ))}
            </ul>
          </div>
        )}
        
        {product.contact_url && (
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button asChild size="lg" className="w-full h-16 bg-primary text-primary-foreground text-xl font-bold transition-all duration-300 neon-button transform hover:scale-105">
              <Link href={product.contact_url} target="_blank" rel="noopener noreferrer">
                <PhoneOutgoing className="mr-4 h-8 w-8" />
                Contactar al Vendedor
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
