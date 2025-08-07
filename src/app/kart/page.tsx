
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
import ModelViewer from '@/components/client/ModelViewer'; // Importamos el nuevo visor 3D
import { createClient } from '@supabase/supabase-js';

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


const KartPage: NextPage = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [kartCategories, setKartCategories] = useState<KartCategoryData[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKarts = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      setLoading(true);
      const { data, error } = await supabase.from('karts').select('*');

      if (error) {
        console.error('Error fetching karts:', error);
      } else {
        const categories = data.map(kart => ({
          name: kart.category,
          description: kart.description,
          modelUrl: kart.model_url,
          parts: BASE_KART_COMPONENTS // Asignamos las partes base a todas las categorías por ahora
        }));
        setKartCategories(categories);
        if (categories.length > 0) {
          setSelectedCategoryName(categories[0].name);
        }
      }
      setLoading(false);
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
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader className="animate-spin h-12 w-12 text-primary" />
            <p className="mt-4 text-muted-foreground">Cargando datos de karts...</p>
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
                 {/* El ModelViewer reemplaza la imagen estática */}
                 <ModelViewer modelUrl={selectedCategoryData?.modelUrl || ''} />
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
    </>
  );
};

export default KartPage;
