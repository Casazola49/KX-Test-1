"use client";

import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds, Center, Html, useProgress } from '@react-three/drei';
import { Loader, Wifi, WifiOff } from 'lucide-react';

// Hook para detectar la calidad de conexión
const useConnectionQuality = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  
  useEffect(() => {
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const checkConnection = () => {
        const slowConnections = ['slow-2g', '2g', '3g'];
        setIsSlowConnection(
          slowConnections.includes(connection.effectiveType) || 
          connection.downlink < 1.5
        );
      };
      
      checkConnection();
      connection.addEventListener('change', checkConnection);
      
      return () => connection.removeEventListener('change', checkConnection);
    }
  }, []);
  
  return isSlowConnection;
};

// Componente de progreso de carga mejorado
const LoadingProgress = () => {
  const { progress, loaded, total } = useProgress();
  
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white bg-black bg-opacity-50 p-6 rounded-lg">
        <Loader className="animate-spin h-12 w-12 mb-4 text-primary" />
        <div className="w-48 bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm font-semibold">{Math.round(progress)}% cargado</p>
        <p className="text-xs text-gray-300 mt-1">
          {(loaded / 1024 / 1024).toFixed(1)}MB / {(total / 1024 / 1024).toFixed(1)}MB
        </p>
      </div>
    </Html>
  );
};

// Componente de modelo optimizado con LOD (Level of Detail)
const OptimizedModel = ({ url, quality = 'high' }: { url: string; quality?: 'low' | 'medium' | 'high' }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef<any>();
  
  const optimizedScene = useMemo(() => {
    const clonedScene = scene.clone();
    
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        // Optimizaciones basadas en la calidad
        if (quality === 'low') {
          // Reducir geometría para conexiones lentas
          if (child.geometry) {
            child.geometry.computeBoundingSphere();
            // Simplificar materiales
            if (child.material) {
              child.material.roughness = 0.8;
              child.material.metalness = 0.2;
            }
          }
          child.castShadow = false;
          child.receiveShadow = false;
        } else if (quality === 'medium') {
          child.castShadow = false;
          child.receiveShadow = true;
        } else {
          child.castShadow = true;
          child.receiveShadow = true;
        }
        
        // Optimizaciones generales
        if (child.material) {
          child.material.needsUpdate = false;
        }
      }
    });
    
    return clonedScene;
  }, [scene, quality]);

  return (
    <Center position={[0, 0.75, 0]}>
      <primitive ref={modelRef} object={optimizedScene} />
    </Center>
  );
};

// Componente de cámara con optimizaciones
const OptimizedCameraController = ({ quality }: { quality: string }) => {
  const { camera, gl } = useThree();
  
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency <= 4;
    
    // Ajustar configuraciones según la calidad
    let pixelRatio = 1;
    if (quality === 'high' && !isMobile && !isLowEnd) {
      pixelRatio = Math.min(window.devicePixelRatio, 2);
    } else if (quality === 'medium') {
      pixelRatio = Math.min(window.devicePixelRatio, 1.5);
    }
    
    gl.setPixelRatio(pixelRatio);
    
    // Configurar cámara
    camera.position.set(2, 2, 3);
    camera.lookAt(0, 0.75, 0);
    
    // Optimizaciones adicionales
    if (quality === 'low' || isLowEnd) {
      gl.antialias = false;
      gl.powerPreference = "high-performance";
    }
  }, [camera, gl, quality]);
  
  return null;
};

interface OptimizedModelViewerProps {
  modelUrl: string;
  autoQuality?: boolean;
}

const OptimizedModelViewer: React.FC<OptimizedModelViewerProps> = ({ 
  modelUrl, 
  autoQuality = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const isSlowConnection = useConnectionQuality();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    if (autoQuality) {
      // Determinar calidad automáticamente
      const isLowEnd = navigator.hardwareConcurrency <= 4;
      const hasLimitedMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      
      if (isSlowConnection || isLowEnd || hasLimitedMemory || isMobile) {
        setQuality('low');
      } else if (isMobile) {
        setQuality('medium');
      } else {
        setQuality('high');
      }
    }
  }, [autoQuality, isSlowConnection, isMobile]);

  useEffect(() => {
    if (modelUrl) {
      // Precargar modelo con prioridad baja
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = modelUrl;
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
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
          <button 
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            className="mt-4 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Indicador de calidad de conexión */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
        {isSlowConnection ? <WifiOff size={12} /> : <Wifi size={12} />}
        <span>Calidad: {quality}</span>
      </div>

      {/* Controles de calidad manual */}
      <div className="absolute top-4 right-4 z-20 flex gap-1">
        {['low', 'medium', 'high'].map((q) => (
          <button
            key={q}
            onClick={() => setQuality(q as any)}
            className={`px-2 py-1 text-xs rounded transition-all ${
              quality === q 
                ? 'bg-primary text-white' 
                : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
            }`}
          >
            {q.charAt(0).toUpperCase()}
          </button>
        ))}
      </div>

      <Canvas
        ref={canvasRef}
        shadows={quality === 'high'}
        camera={{ fov: isMobile ? 60 : 50 }}
        style={{ background: 'transparent' }}
        className="w-full h-full"
        gl={{
          antialias: quality !== 'low',
          alpha: true,
          powerPreference: quality === 'low' ? "high-performance" : "default",
          stencil: false,
          depth: true
        }}
        onCreated={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        performance={{
          min: quality === 'low' ? 0.2 : 0.5,
          max: quality === 'high' ? 1 : 0.8,
          debounce: quality === 'low' ? 200 : 100
        }}
      >
        {/* Luces optimizadas según calidad */}
        <ambientLight intensity={quality === 'low' ? 2 : 1.2} />
        {quality === 'high' && (
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
        {quality === 'medium' && (
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
        )}
        {quality === 'low' && (
          <directionalLight position={[0, 5, 5]} intensity={2} />
        )}

        <Suspense fallback={<LoadingProgress />}>
          <Bounds fit clip observe margin={1.2}>
            <OptimizedModel url={modelUrl} quality={quality} />
          </Bounds>
        </Suspense>

        <OptimizedCameraController quality={quality} />

        <OrbitControls
          minDistance={isMobile ? 1.5 : 2}
          maxDistance={isMobile ? 8 : 10}
          enablePan={false}
          target={[0, 0.75, 0]}
          enableDamping={quality !== 'low'}
          dampingFactor={0.05}
          rotateSpeed={isMobile ? 0.8 : 1}
          zoomSpeed={isMobile ? 0.8 : 1}
          maxPolarAngle={Math.PI * 0.8}
          minPolarAngle={Math.PI * 0.2}
        />
      </Canvas>

      {/* Controles de ayuda */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
        {isMobile ? 'Toca y arrastra para rotar' : 'Clic y arrastra para rotar'}
      </div>
    </div>
  );
};

export default OptimizedModelViewer;