#!/usr/bin/env node

/**
 * Script para agregar imágenes de ejemplo a la galería de Firebase
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Imágenes de ejemplo usando URLs de Cloudinary o placeholders
const sampleImages = [
  {
    title: "Carrera Nacional de Karting",
    description: "Emocionante carrera en el circuito principal con más de 30 participantes",
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    alt: "Carrera de karting en pista",
    type: "image",
    category: "carreras"
  },
  {
    title: "Kart de Competición",
    description: "Kart profesional preparado para competencia de alto nivel",
    src: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop",
    alt: "Kart de competición",
    type: "image",
    category: "karts"
  },
  {
    title: "Podium de Campeones",
    description: "Ceremonia de premiación del campeonato nacional",
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    alt: "Podium de premiación",
    type: "image",
    category: "eventos"
  },
  {
    title: "Pista de Karting",
    description: "Vista aérea de nuestra pista principal con todas sus curvas técnicas",
    src: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
    alt: "Vista aérea de pista de karting",
    type: "image",
    category: "pistas"
  },
  {
    title: "Mecánicos en Acción",
    description: "Equipo técnico preparando los karts antes de la carrera",
    src: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
    alt: "Mecánicos trabajando en karts",
    type: "image",
    category: "equipo"
  },
  {
    title: "Largada de Carrera",
    description: "Momento emocionante de la largada con todos los pilotos en posición",
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    alt: "Largada de carrera de karting",
    type: "image",
    category: "carreras"
  }
];

async function addGalleryImages() {
  console.log('🖼️ Agregando imágenes de ejemplo a la galería...\n');

  try {
    for (const image of sampleImages) {
      const docRef = await addDoc(collection(db, 'gallery'), {
        ...image,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        featured: false,
        views: 0
      });
      
      console.log(`✅ Imagen agregada: "${image.title}" (ID: ${docRef.id})`);
    }
    
    console.log(`\n🎉 Se agregaron ${sampleImages.length} imágenes a la galería exitosamente!`);
    console.log('💡 Ahora la galería en la página de inicio debería mostrar contenido.');
    
  } catch (error) {
    console.error('❌ Error agregando imágenes:', error.message);
  }
}

addGalleryImages().catch(console.error);