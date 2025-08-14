
"use client";

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds, Center, Html } from '@react-three/drei';
import { Loader } from 'lucide-react';

// Preload de modelos para carga más rápida
const preloadModel = (url: string) => {
  if (url) {
    useGLTF.preload(url);
  }
};

// Componente de carga optimizado
const LoadingFallback = () => (
  <Html center>
    <div className="flex flex-col items-center justify-center text-white">
      <Loader className="animate-spin h-8 w-8 mb-2" />
      <p className="text-sm">Cargando modelo 3D...</p>
    </div>
  </Html>
);

// Componente para ajustar la cámara y optimizar el renderizado
const CameraController = () => {
  const { camera, gl } = useThree();
  
  useEffect(() => {
    // Optimizaciones de rendimiento
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency <= 4;
    
    // Ajustar pixel ratio según el dispositivo
    const pixelRatio = isMobile || isLowEnd ? 1 : Math.min(window.devicePixelRatio, 2);
    gl.setPixelRatio(pixelRatio);
    
    // Configurar la cámara
    camera.position.set(2, 2, 3);
    camera.lookAt(0, 0.75, 0);
    
    // Optimizaciones adicionales para dispositivos de bajo rendimiento
    if (isLowEnd) {
      gl.antialias = false;
      gl.powerPreference = "high-performance";
    }
  }, [camera, gl]);
  
  return null;
};

// Componente que carga y muestra el modelo GLB optimizado
const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  
  // Optimizar el modelo para mejor rendimiento
  const optimizedScene = useMemo(() => {
    const clonedScene = scene.clone();
    
    // Optimizaciones del modelo
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        // Optimizar materiales para mejor rendimiento
        if (child.material) {
          child.material.needsUpdate = false;
          // Reducir calidad de sombras en dispositivos móviles
          if (window.innerWidth < 768) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        }
      }
    });
    
    return clonedScene;
  }, [scene]);

  return (
    <Center position={[0, 0.75, 0]}>
      <primitive object={optimizedScene} />
    </Center>
  );
};

// Componente principal del visor optimizado
const ModelViewer = ({ modelUrl }: { modelUrl: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    if (modelUrl) {
      // Precargar el modelo
      preloadModel(modelUrl);
      
      // Simular tiempo de carga mínimo para UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [modelUrl]);

  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">🏎️</div>
          <p className="text-lg font-semibold">No hay modelo 3D disponible</p>
          <p className="text-sm text-gray-300 mt-2">Selecciona una categoría de kart</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900 to-red-800 text-white rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-semibold">Error al cargar el modelo</p>
          <p className="text-sm text-gray-300 mt-2">Intenta recargar la página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Indicador de carga superpuesto */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg z-10">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
            <p className="text-lg font-semibold">Cargando modelo 3D...</p>
            <p className="text-sm text-gray-300 mt-2">Esto puede tomar unos segundos</p>
          </div>
        </div>
      )}

      <Canvas
        shadows={!isMobile} // Desactivar sombras en móviles para mejor rendimiento
        camera={{ fov: isMobile ? 60 : 50 }}
        style={{ background: 'transparent' }}
        className="w-full h-full"
        gl={{
          antialias: !isMobile, // Desactivar antialiasing en móviles
          alpha: true,
          powerPreference: "high-performance"
        }}
        onCreated={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      >
        {/* Configuración de luces optimizada */}
        <ambientLight intensity={isMobile ? 1.5 : 1.2} />
        {!isMobile && (
          <>
            <spotLight 
              position={[10, 10, 10]} 
              angle={0.15} 
              penumbra={1} 
              intensity={2} 
              castShadow 
            />
            <directionalLight position={[-10, -10, -5]} intensity={0.8} />
          </>
        )}
        {isMobile && (
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
        )}

        <Suspense fallback={<LoadingFallback />}>
          <Bounds fit clip observe margin={1.2}>
            <Model url={modelUrl} />
          </Bounds>
        </Suspense>

        <CameraController />

        <OrbitControls
          minDistance={isMobile ? 1.5 : 2}
          maxDistance={isMobile ? 8 : 10}
          enablePan={false}
          target={[0, 0.75, 0]}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={isMobile ? 0.8 : 1}
          zoomSpeed={isMobile ? 0.8 : 1}
        />
      </Canvas>

      {/* Controles de ayuda */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
        {isMobile ? 'Toca y arrastra para rotar' : 'Clic y arrastra para rotar'}
      </div>
    </div>
  );
};

export default ModelViewer;
