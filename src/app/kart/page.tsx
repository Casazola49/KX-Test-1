
"use client";

import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { HelpCircle, Info, X, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import OptimizedModelViewer from '@/components/client/OptimizedModelViewer'; // Importamos el visor 3D optimizado
import HorizontalAd from '@/components/shared/HorizontalAd';

// Tipos para los datos
interface KartPart {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  aiHint: string;
  techData: { label: string; value: string }[];
}

interface KartCategoryData {
  name: string;
  description: string;
  parts: KartPart[];
  modelUrl: string; // URL al modelo .glb
}

const BASE_KART_COMPONENTS: KartPart[] = [
    {
    id: "chassis",
    title: "Chasis",
    description: "La estructura principal del kart, responsable de la rigidez y el manejo. Fabricado con tubos de acero de alta resistencia para soportar las fuerzas G en curvas.",
    imageUrl: "/partes/chasis 1.png",
    aiHint: "kart chassis frame",
    techData: [
      { label: "Material", value: "Acero al cromo-molibdeno" },
      { label: "Diámetro Tubos", value: "28mm - 32mm" },
      { label: "Rigidez", value: "Ajustable (barras de torsión)" },
    ],
  },
  {
    id: "engine",
    title: "Motor",
    description: "El corazón del kart, proporciona la potencia. Existen diferentes tipos y cilindradas según la categoría, desde motores de 2 tiempos hasta 4 tiempos.",
    imageUrl: "/partes/motor.png",
    aiHint: "kart engine detail",
    techData: [
      { label: "Tipo Común", value: "Monocilíndrico, 2 tiempos" },
      { label: "Cilindrada (Ej.)", value: "125cc (Rotax Max, IAME X30)" },
      { label: "Refrigeración", value: "Líquida o por aire" },
    ],
  },
  {
    id: "tires",
    title: "Neumáticos",
    description: "El único punto de contacto con la pista. Su compuesto y presión son cruciales para el agarre y rendimiento. Existen slicks para seco y rayados para lluvia.",
    imageUrl: "/partes/neumatico.png",
    aiHint: "karting tires stack",
    techData: [
      { label: "Tipos", value: "Slick, Lluvia (Rain)" },
      { label: "Compuestos", value: "Blando, Medio, Duro" },
      { label: "Presión (Ej.)", value: "0.8 - 1.2 bar" },
    ],
  },
  {
    id: "steering_wheel",
    title: "Volante",
    description: "Permite al piloto controlar la dirección del kart. Suelen ser pequeños, de agarre firme y pueden incluir botones para telemetría o ajustes.",
    imageUrl: "/partes/volante.png",
    aiHint: "kart steering wheel",
    techData: [
      { label: "Diámetro Típico", value: "280mm - 350mm" },
      { label: "Materiales", value: "Aluminio, Alcántara, Goma" },
      { label: "Funciones Adicionales", value: "Display LCD (opcional)" },
    ],
  },
  {
    id: "brakes",
    title: "Frenos",
    description: "Sistema vital para la seguridad y el rendimiento. Generalmente frenos de disco hidráulicos, actuando sobre el eje trasero o en las cuatro ruedas en categorías superiores.",
    imageUrl: "/partes/frenos.png",
    aiHint: "kart brake system",
    techData: [
      { label: "Tipo Común", value: "Disco hidráulico trasero" },
      { label: "Material Disco", value: "Acero ventilado o flotante" },
      { label: "Pastillas", value: "Compuestos orgánicos o sinterizados" },
    ],
  },
  {
    id: "seat",
    title: "Asiento",
    description: "Moldeado para el cuerpo del piloto, influye en la distribución del peso y la conexión con el chasis. Fabricados en fibra de vidrio o carbono.",
    imageUrl: "/partes/asiento.png",
    aiHint: "kart racing seat",
    techData: [
      { label: "Materiales", value: "Fibra de vidrio, Carbono" },
      { label: "Tallas", value: "Varias, según piloto" },
      { label: "Fijación", value: "Rígida al chasis" },
    ],
  },
  {
    id: "pedals",
    title: "Pedales",
    description: "Controlan el acelerador y el freno. Su posición es ajustable para adaptarse a la ergonomía del piloto.",
    imageUrl: "/partes/pedales.png",
    aiHint: "kart pedals set",
    techData: [
      { label: "Funciones", value: "Acelerador, Freno" },
      { label: "Material", value: "Aluminio" },
      { label: "Ajuste", value: "Longitudinal" },
    ],
  },
  {
    id: "bodywork",
    title: "Carrocería",
    description: "Componentes plásticos que cubren partes del kart, mejoran la aerodinámica y la seguridad. Incluye pontones laterales, spoiler delantero y panel trasero.",
    imageUrl: "/partes/carroceria 1.png",
    aiHint: "kart bodywork plastic",
    techData: [
      { label: "Componentes", value: "Pontones, Spoiler, Nassau Panel" },
      { label: "Material", value: "Plástico flexible y resistente" },
      { label: "Homologación", value: "CIK-FIA (en competencia)" },
    ],
  },
];


// Mapeo de categorías a modelos locales en /public/kart
const CATEGORY_MODEL_MAP: Record<string, string> = {
  'F200 Super': '/kart/F200 super.glb',
  'F200 Standard': '/kart/F200 Standard.glb',
  'F200 SUPER': '/kart/F200 super.glb',
  'F200 STANDARD': '/kart/F200 Standard.glb',
  '125cc Profesional': '/kart/125 cc profesional.glb',
  '125 CC PROFESIONAL': '/kart/125 cc profesional.glb',
  '100cc Junior': '/kart/100 cc junior.glb',
  '100 CC JUNIOR': '/kart/100 cc junior.glb',
  'Mini 60': '/kart/mini 60.glb',
  'MINI 60': '/kart/mini 60.glb',
  'Infantil 6.5': '/kart/infantil 6.5.glb',
  'INFANTIL 6.5': '/kart/infantil 6.5.glb',
  'Baby Kart': '/kart/baby kart.glb',
  'BABY KART': '/kart/baby kart.glb',
  'default': '/kart/F200 Standard.glb'
};

const KartPage: NextPage = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [kartCategories, setKartCategories] = useState<KartCategoryData[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKarts = async () => {
      setLoading(true);
      
      // Datos por defecto que siempre funcionan
      const defaultCategories = [
        {
          name: 'Kart Estándar',
          description: 'Kart básico para principiantes y competencia amateur',
          modelUrl: '/kart/MarioKart.glb',
          parts: BASE_KART_COMPONENTS
        }
      ];
      
      try {
        // Intentar obtener karts desde Firebase con timeout corto
        const { getAllKarts } = await import('@/lib/data-service');
        
        const timeoutPromise = new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        const karts = await Promise.race([getAllKarts(), timeoutPromise]) as any[];
        
        console.log('🏎️ Karts obtenidos de Firebase:', karts);
        console.log('📊 Cantidad de karts:', karts?.length || 0);
        
        // Mostrar detalles de cada kart para diagnóstico
        if (karts && Array.isArray(karts)) {
          karts.forEach((kart, index) => {
            console.log(`\n--- Kart ${index + 1} ---`);
            console.log('ID:', kart.id);
            console.log('Nombre:', kart.name);
            console.log('Categoría:', kart.category);
            console.log('URL del modelo:', kart.model_url);
            console.log('Descripción:', kart.description);
            
            if (kart.model_url) {
              if (kart.model_url.includes('supabase.co')) {
                console.warn('⚠️ URL de Supabase detectada - NO FUNCIONA');
              } else if (kart.model_url.includes('cloudinary.com')) {
                console.log('✅ URL de Cloudinary - debería funcionar');
              } else if (kart.model_url.startsWith('/')) {
                console.log('✅ URL local - debería funcionar');
              }
            } else {
              console.warn('⚠️ No hay URL de modelo');
            }
          });
        }
        
        if (karts && Array.isArray(karts) && karts.length > 0) {
          const categories = karts
            .filter(kart => kart && kart.category)
            .map(kart => {
              let modelUrl = kart.model_url;
              
              // Si la URL es de Supabase Storage o Firebase Storage (ya no accesibles), usar modelo local
              if (modelUrl && (modelUrl.includes('supabase.co') || modelUrl.includes('firebasestorage'))) {
                // Buscar modelo local basado en la categoría
                const categoryKey = Object.keys(CATEGORY_MODEL_MAP).find(
                  key => kart.category.toLowerCase().includes(key.toLowerCase()) || 
                         key.toLowerCase().includes(kart.category.toLowerCase())
                );
                modelUrl = categoryKey ? CATEGORY_MODEL_MAP[categoryKey] : CATEGORY_MODEL_MAP['default'];
                console.log(`🔄 Usando modelo local para ${kart.category}: ${modelUrl}`);
              }
              
              // Si no hay URL o está vacía, usar modelo basado en categoría
              if (!modelUrl || modelUrl.trim() === '') {
                const categoryKey = Object.keys(CATEGORY_MODEL_MAP).find(
                  key => kart.category.toLowerCase().includes(key.toLowerCase()) || 
                         key.toLowerCase().includes(kart.category.toLowerCase())
                );
                modelUrl = categoryKey ? CATEGORY_MODEL_MAP[categoryKey] : CATEGORY_MODEL_MAP['default'];
              }
              
              // Si la URL no empieza con / o http, añadir /
              if (modelUrl && !modelUrl.startsWith('/') && !modelUrl.startsWith('http')) {
                modelUrl = '/' + modelUrl;
              }
              
              console.log(`✅ Categoría: ${kart.category}, Modelo: ${modelUrl}`);
              
              return {
                name: kart.category || kart.name || 'Kart',
                description: kart.description || `Kart ${kart.category || kart.name}`,
                modelUrl: modelUrl,
                parts: BASE_KART_COMPONENTS
              };
            });
          
          if (categories.length > 0) {
            console.log('✅ Usando categorías de Firebase:', categories);
            setKartCategories(categories);
            setSelectedCategoryName(categories[0].name);
          } else {
            console.log('⚠️ No hay categorías válidas, usando datos por defecto');
            setKartCategories(defaultCategories);
            setSelectedCategoryName(defaultCategories[0].name);
          }
        } else {
          console.log('ℹ️ No hay karts en Firebase, usando datos por defecto');
          console.log('\n📝 NOTA: Para agregar karts, ve a /admin/karts');
          setKartCategories(defaultCategories);
          setSelectedCategoryName(defaultCategories[0].name);
        }
      } catch (error: any) {
        console.warn('⚠️ Error al cargar karts de Firebase, usando datos por defecto:', error?.message);
        setKartCategories(defaultCategories);
        setSelectedCategoryName(defaultCategories[0].name);
      } finally {
        setLoading(false);
      }
    };

    fetchKarts();
  }, []);

  const selectedCategoryData = kartCategories.find(c => c.name === selectedCategoryName);
  const currentPartInfo = selectedCategoryData?.parts[currentPartIndex];

  const handleCategoryChange = (newCategoryName: string) => {
    setSelectedCategoryName(newCategoryName);
    setCurrentPartIndex(0); // Reset part index when category changes
  };

  const handleNextPart = () => {
    if (selectedCategoryData) {
      setCurrentPartIndex((prevIndex) => (prevIndex + 1) % selectedCategoryData.parts.length);
    }
  };

  const handlePrevPart = () => {
    if (selectedCategoryData) {
      setCurrentPartIndex((prevIndex) => (prevIndex - 1 + selectedCategoryData.parts.length) % selectedCategoryData.parts.length);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <Loader className="animate-spin h-12 w-12 text-primary" />
            <p className="mt-4 text-muted-foreground">Cargando datos de karts...</p>
        </div>
    );
  }

  // Si no hay categorías después de cargar, mostrar error
  if (!kartCategories || kartCategories.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <HelpCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No hay datos disponibles</h2>
            <p className="text-muted-foreground mb-4">No se pudieron cargar los datos de karts.</p>
            <Button onClick={() => window.location.reload()}>
                Reintentar
            </Button>
        </div>
    );
  }

  return (
    <>
      <PageTitle title="Explora el Kart" subtitle="Una Mirada Detallada a la Máquina" />
      <Section className="py-2 md:py-4 relative">
        <Tabs value={selectedCategoryName} onValueChange={handleCategoryChange} className="w-full">
          <div className="container mx-auto flex justify-center mb-6 md:mb-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 p-1 h-auto">
              {kartCategories.map(category => (
                <TabsTrigger key={category.name} value={category.name} className="py-2 text-xs md:text-sm whitespace-normal h-auto">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={selectedCategoryName} className="mt-0">
            {showInstructions && (
              <Card className="absolute top-20 left-1/2 transform -translate-x-1/2 w-11/12 md:w-auto max-w-lg z-20 bg-background/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center">
                    <HelpCircle className="mr-2 text-primary" />
                    <CardTitle className="text-md">Instrucciones</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowInstructions(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={18} />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Usa el ratón para rotar y hacer zoom en el modelo 3D.</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 min-h-[70vh] md:min-h-[80vh]">
              <div className="h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-auto lg:col-span-2 relative bg-card rounded-lg shadow-xl border border-border flex items-center justify-center p-4">
                 {/* El OptimizedModelViewer con carga inteligente */}
                 <OptimizedModelViewer modelUrl={selectedCategoryData?.modelUrl || ''} autoQuality={true} />
              </div>

              <Card className="lg:col-span-1 rounded-lg shadow-xl p-4 md:p-6 border border-border overflow-y-auto flex flex-col">
                 {selectedCategoryData ? (
                    <>
                        <div className="text-center mb-4">
                          <h2 className="text-2xl font-bold font-headline text-primary">{selectedCategoryData.name}</h2>
                          <p className="text-sm text-muted-foreground mt-1">{selectedCategoryData.description}</p>
                        </div>
                        
                        <hr className="border-border my-4" />

                        {currentPartInfo ? (
                          <>
                            <div className="flex items-center justify-between mb-4">
                              <Button variant="outline" size="icon" onClick={handlePrevPart} aria-label="Parte anterior">
                                <ChevronLeft size={20} />
                              </Button>
                              <div className="flex items-center text-center">
                                <Info size={24} className="mr-2 text-primary flex-shrink-0" />
                                <h2 className="text-xl md:text-2xl font-bold font-headline text-primary">{currentPartInfo.title}</h2>
                              </div>
                              <Button variant="outline" size="icon" onClick={handleNextPart} aria-label="Siguiente parte">
                                <ChevronRight size={20} />
                              </Button>
                            </div>
                            
                            <div className="relative aspect-video w-full rounded-md overflow-hidden mb-4 border border-border shadow-inner">
                              <Image 
                                src={currentPartInfo.imageUrl} 
                                alt={currentPartInfo.title} 
                                fill
                                className="object-contain"
                                sizes="(max-width: 1023px) 100vw, 33vw"
                                data-ai-hint={currentPartInfo.aiHint}
                                unoptimized
                                onError={(e) => {
                                  console.error('Error cargando imagen:', currentPartInfo.imageUrl);
                                  // Usar una imagen placeholder si falla
                                  (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                }}
                              />
                            </div>
                            
                            <CardDescription className="text-sm text-muted-foreground mb-4 leading-relaxed flex-grow min-h-[60px]">
                              {currentPartInfo.description}
                            </CardDescription>

                            {currentPartInfo.techData.length > 0 && (
                              <div>
                                <h3 className="text-md font-semibold mb-2 text-foreground">Datos Técnicos:</h3>
                                <ul className="space-y-1 text-xs text-muted-foreground">
                                  {currentPartInfo.techData.map((data, index) => (
                                    <li key={index} className="flex justify-between border-b border-border/50 pb-1">
                                      <span className="font-medium text-foreground/80">{data.label}:</span>
                                      <span>{data.value}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center h-full">
                            <HelpCircle size={48} className="text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground">Información no disponible</h3>
                            <p className="text-sm text-muted-foreground">No hay componentes para mostrar en esta categoría.</p>
                          </div>
                        )}
                    </>
                 ) : (
                    <div className="flex flex-col items-center justify-center text-center h-full">
                        <HelpCircle size={48} className="text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">No hay categorías de kart</h3>
                        <p className="text-sm text-muted-foreground">Añade una categoría desde el panel de administrador.</p>
                    </div>
                 )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Section>
      
      <HorizontalAd section="kart" />
    </>
  );
};

export default KartPage;
