
"use client";

import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds, Center } from '@react-three/drei';

// Componente para ajustar la cámara y optimizar el renderizado
const CameraController = () => {
  const { camera, gl } = useThree();
  useEffect(() => {
    // Ajusta la posición inicial de la cámara para un buen encuadre
    camera.position.set(2, 2, 3); 
    // Apunta la cámara ligeramente hacia arriba, al centro del kart
    camera.lookAt(0, 0.75, 0); // Ajustado para coincidir con la nueva altura del modelo
    // Optimiza el pixel ratio para pantallas de alta resolución, mejorando el rendimiento
    gl.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1); 
  }, [camera, gl]);
  return null;
};

// Componente que carga y muestra el modelo GLB, ahora centrado y elevado
const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return (
    // CORRECCIÓN: Se añade 'position' para elevar el modelo verticalmente
    <Center position={[0, 0.75, 0]}>
      <primitive object={scene.clone()} />
    </Center>
  );
};

// Componente principal del visor, ahora más robusto
const ModelViewer = ({ modelUrl }: { modelUrl: string }) => {
  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white rounded-lg">
        <p>No hay un modelo 3D disponible.</p>
      </div>
    );
  }

  return (
    <Canvas
      shadows
      camera={{ fov: 50 }} // Un campo de visión ligeramente más amplio
      style={{ background: 'transparent' }}
      className="w-full h-full"
    >
      {/* Mejor configuración de luces para un aspecto más profesional */}
      <ambientLight intensity={1.2} />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2} 
        castShadow 
      />
      <directionalLight position={[-10, -10, -5]} intensity={0.8} />

      <Suspense fallback={null}>
        {/* Bounds ahora envuelve al modelo para escalar y centrar automáticamente */}
        <Bounds fit clip observe margin={1.2}>
          <Model url={modelUrl} />
        </Bounds>
      </Suspense>

      <CameraController />

      <OrbitControls
        minDistance={2}      // Límite de zoom (acercar) más estricto
        maxDistance={10}     // Límite de zoom (alejar)
        enablePan={false}    // Deshabilita el movimiento lateral para mantenerlo centrado
        target={[0, 0.75, 0]} // Se ajusta el objetivo para que coincida con la nueva altura del modelo
      />
    </Canvas>
  );
};

export default ModelViewer;
