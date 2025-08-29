// Script para agregar productos de muestra a Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Configuración de Firebase usando variables de entorno
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

// Productos de muestra con diferentes categorías
const sampleProducts = [
  // CATEGORÍA: CHASIS
  {
    name: "Chasis Profesional KX-Pro",
    slug: "chasis-profesional-kx-pro",
    summary: "Chasis de alta resistencia para competición profesional",
    description: "Chasis fabricado en acero de alta resistencia con soldaduras TIG. Diseñado para máximo rendimiento en pista.",
    price: 2500,
    stock: 5,
    image_url: "https://via.placeholder.com/800x600/1a1a1a/00ff00?text=Chasis+Profesional",
    gallery_images: [
      "https://via.placeholder.com/800x600/1a1a1a/00ff00?text=Chasis+Profesional",
      "https://via.placeholder.com/800x600/2a2a2a/00ff00?text=Vista+Lateral"
    ],
    category: "Chasis",
    subcategory: "Profesional",
    brand: "KX Racing",
    is_featured: true,
    department: "General",
    specifications: {
      "Material": "Acero al carbono",
      "Peso": "32 kg",
      "Longitud": "1.8m",
      "Ancho": "1.4m"
    },
    tags: ["profesional", "competición", "resistente"],
    sponsor_level: "PLATINUM"
  },
  {
    name: "Chasis Junior Starter",
    slug: "chasis-junior-starter",
    summary: "Chasis ideal para pilotos principiantes y categorías junior",
    description: "Chasis diseñado especialmente para pilotos jóvenes con características de seguridad mejoradas.",
    price: 1800,
    stock: 8,
    image_url: "https://via.placeholder.com/800x600/1a1a1a/ffaa00?text=Chasis+Junior",
    category: "Chasis",
    subcategory: "Junior",
    brand: "KX Racing",
    is_featured: false,
    department: "General",
    specifications: {
      "Material": "Acero al carbono",
      "Peso": "28 kg",
      "Longitud": "1.6m",
      "Ancho": "1.2m"
    },
    tags: ["junior", "principiante", "seguro"],
    sponsor_level: "GOLD"
  },

  // CATEGORÍA: MOTORES
  {
    name: "Motor Rotax Max 125cc",
    slug: "motor-rotax-max-125cc",
    summary: "Motor de 2 tiempos de alta performance para competición",
    description: "Motor Rotax Max de 125cc, reconocido mundialmente por su confiabilidad y rendimiento en competiciones internacionales.",
    price: 3200,
    stock: 3,
    image_url: "https://via.placeholder.com/800x600/1a1a1a/ff0000?text=Motor+Rotax",
    category: "Motores",
    subcategory: "2 Tiempos",
    brand: "Rotax",
    is_featured: true,
    department: "General",
    specifications: {
      "Cilindrada": "125cc",
      "Potencia": "30 HP",
      "Tipo": "2 tiempos",
      "Refrigeración": "Líquida"
    },
    tags: ["rotax", "125cc", "competición", "2t"],
    sponsor_level: "PLATINUM"
  },
  {
    name: "Motor Honda GX160",
    slug: "motor-honda-gx160",
    summary: "Motor 4 tiempos confiable para karting recreativo",
    description: "Motor Honda GX160 de 4 tiempos, ideal para karting recreativo y escuelas de manejo.",
    price: 1200,
    stock: 12,
    image_url: "https://via.placeholder.com/800x600/1a1a1a/0066ff?text=Motor+Honda",
    category: "Motores",
    subcategory: "4 Tiempos",
    brand: "Honda",
    is_featured: false,
    department: "General",
    specifications: {
      "Cilindrada": "163cc",
      "Potencia": "5.5 HP",
      "Tipo": "4 tiempos",
      "Refrigeración": "Aire"
    },
    tags: ["honda", "4t", "recreativo", "confiable"],
    sponsor_level: "GOLD"
  },

  // CATEGORÍA: NEUMÁTICOS
  {
    name: "Neumáticos Bridgestone YDS",
    slug: "neumaticos-bridgestone-yds",
    summary: "Neumáticos de competición para pista seca",
    description: "Neumáticos Bridgestone YDS especialmente diseñados para competiciones en pista seca con máximo agarre.",
    price: 280,
    stock: 24,
    image_url: "https://via.placeholder.com/800x600/1a1a1a/ffffff?text=Neumáticos+Secos",
    category: "Neumáticos",
    subcategory: "Pista Seca",
    brand: "Bridgestone",
    is_featured: true,
    department: "General",
    specifications: {
      "Medida": "10x4.50-5",
      "Compuesto": "Blando",
      "Uso": "Competición",
      "Durabilidad": "Alta"
    },
    tags: ["bridgestone", "competición", "agarre", "seco"],
    sponsor_level: "PLATINUM"
  },
  {
    name: "Neumáticos Lluvia Wet",
    slug: "neumaticos-lluvia-wet",
    summary: "Neumáticos especiales para condiciones húmedas",
    description: "Neumáticos con dibujo especial para evacuar agua y mantener el agarre en condiciones de lluvia.",
    price: 320,
    stock: 16,
    image_url: "https://via.placeholder.com/800x600/1a1a1a/0099ff?text=Neumáticos+Lluvia",
    category: "Neumáticos",
    subcategory: "Lluvia",
    brand: "Bridgestone",
    is_featured: false,
    department: "General",
    specifications: {
      "Medida": "10x4.50-5",
      "Compuesto": "Medio",
      "Uso": "Lluvia",
      "Dibujo": "Direccional"
    },
    tags: ["lluvia", "wet", "agarre", "evacuación"],
    sponsor_level: "GOLD"
  },

  // CATEGORÍA: SEGURIDAD
  {
    name: "Casco Arai GP-6S",
    slug: "casco-arai-gp-6s",
    summary: "Casco profesional homologado FIA para competición",
    description: "Casco Arai GP-6S con homologación FIA 8860-2018, máxima protección para pilotos profesionales.",
    price: 1800,
    stock: 6,
    image_url: "https://via.placeholder.com/800x600/1a1a1a/ff6600?text=Casco+Arai",
    category: "Seguridad",
    subcategory: "Cascos",
    brand: "Arai",
    is_featured: true,
    department: "General",
    specifications: {
      "Homologación": "FIA 8860-2018",
      "Material": "Fibra de carbono",
      "Peso": "1.4 kg",
      "Tallas": "XS-XXL"
    },
    tags: ["arai", "fia", "profesional", "carbono"],
    sponsor_level: "PLATINUM"
  },
  {
    name: "Mono de Competición Sparco",
    slug: "mono-competicion-sparco",
    summary: "Mono ignífugo homologado para competición",
    description: "Mono Sparco de 3 capas con homologación FIA, máxima protección y comodidad para el piloto.",
    price: 650,
    stock: 15,
    image_url: "https://via.placeholder.com/800x600/1a1a1a/cc0000?text=Mono+Sparco",
    category: "Seguridad",
    subcategory: "Monos",
    brand: "Sparco",
    is_featured: false,
    department: "General",
    specifications: {
      "Homologación": "FIA 8856-2018",
      "Capas": "3",
      "Material": "Nomex",
      "Tallas": "S-XXL"
    },
    tags: ["sparco", "ignífugo", "fia", "nomex"],
    sponsor_level: "GOLD"
  },

  // CATEGORÍA: REPUESTOS
  {
    name: "Pernos de Titanio M8x25",
    slug: "pernos-titanio-m8x25",
    summary: "Pernos de titanio grado 5 para reducción de peso",
    description: "Set de pernos de titanio grado 5, ideales para reducir peso sin comprometer la resistencia.",
    price: 45,
    stock: 50,
    image_url: "https://via.placeholder.com/800x600/1a1a1a/cccccc?text=Pernos+Titanio",
    category: "Repuestos",
    subcategory: "Pernos",
    brand: "TiRacing",
    is_featured: false,
    department: "General",
    specifications: {
      "Material": "Titanio Grado 5",
      "Medida": "M8x25mm",
      "Peso": "8g c/u",
      "Cantidad": "10 unidades"
    },
    tags: ["titanio", "liviano", "resistente", "m8"],
    sponsor_level: "SILVER"
  },
  {
    name: "Pernos Acero Inoxidable M6x20",
    slug: "pernos-acero-inoxidable-m6x20",
    summary: "Pernos de acero inoxidable para uso general",
    description: "Pernos de acero inoxidable 316L, resistentes a la corrosión para uso general en el kart.",
    price: 15,
    stock: 100,
    image_url: "https://via.placeholder.com/800x600/1a1a1a/888888?text=Pernos+Acero",
    category: "Repuestos",
    subcategory: "Pernos",
    brand: "FastKart",
    is_featured: false,
    department: "General",
    specifications: {
      "Material": "Acero Inoxidable 316L",
      "Medida": "M6x20mm",
      "Peso": "12g c/u",
      "Cantidad": "20 unidades"
    },
    tags: ["acero", "inoxidable", "económico", "m6"],
    sponsor_level: "BRONZE"
  },

  // PRODUCTOS REGIONALES
  {
    name: "Kit Mantenimiento Cochabamba",
    slug: "kit-mantenimiento-cochabamba",
    summary: "Kit completo de mantenimiento para talleres locales",
    description: "Kit de mantenimiento especialmente diseñado para las condiciones de Cochabamba.",
    price: 180,
    stock: 20,
    image_url: "https://via.placeholder.com/800x600/1a1a1a/00aa00?text=Kit+Mantenimiento",
    category: "Mantenimiento",
    subcategory: "Kits",
    brand: "KartBolivia",
    is_featured: false,
    department: "Cochabamba",
    specifications: {
      "Incluye": "Aceites, filtros, herramientas",
      "Uso": "Mantenimiento general",
      "Duración": "3 meses",
      "Garantía": "6 meses"
    },
    tags: ["mantenimiento", "cochabamba", "local", "kit"],
    sponsor_level: "SILVER"
  }
];

async function addSampleProducts() {
  console.log('Agregando productos de muestra...');
  
  try {
    for (const product of sampleProducts) {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`✅ Producto agregado: ${product.name} (ID: ${docRef.id})`);
    }
    
    console.log(`\n🎉 Se agregaron ${sampleProducts.length} productos de muestra exitosamente!`);
    console.log('\nCategorías creadas:');
    const categories = [...new Set(sampleProducts.map(p => p.category))];
    categories.forEach(cat => console.log(`- ${cat}`));
    
  } catch (error) {
    console.error('❌ Error agregando productos:', error);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  addSampleProducts().then(() => {
    console.log('\n✨ Proceso completado!');
    process.exit(0);
  });
}

module.exports = { addSampleProducts, sampleProducts };