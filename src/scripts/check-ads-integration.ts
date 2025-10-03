// Script para verificar la integración de anuncios en todas las páginas

const pagesWithAds = [
  { path: '/', section: 'home', name: 'Página Principal' },
  { path: '/noticias', section: 'noticias', name: 'Noticias' },
  { path: '/eventos', section: 'eventos', name: 'Eventos' },
  { path: '/contacto', section: 'contacto', name: 'Contacto' },
  { path: '/galeria', section: 'galeria', name: 'Galería' },
  { path: '/equipamiento-servicios', section: 'equipamiento', name: 'Equipamiento' },
];

export async function checkAdsIntegration() {
  console.log('🔍 Verificando integración de anuncios...\n');
  
  for (const page of pagesWithAds) {
    try {
      const response = await fetch(`http://localhost:9008/api/advertisements?section=${page.section}&type=horizontal&_t=${Date.now()}`);
      const data = await response.json();
      
      console.log(`📄 ${page.name} (${page.path}):`);
      console.log(`   Sección: ${page.section}`);
      console.log(`   Anuncios encontrados: ${data.advertisements?.length || 0}`);
      
      if (data.advertisements?.length > 0) {
        data.advertisements.forEach((ad: any, index: number) => {
          console.log(`   ${index + 1}. ${ad.name} (${ad.is_active ? '✅ Activo' : '❌ Inactivo'})`);
        });
      } else {
        console.log('   ⚠️  No hay anuncios configurados para esta sección');
      }
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error verificando ${page.name}: ${error}`);
      console.log('');
    }
  }
  
  // Verificar anuncios globales
  try {
    const response = await fetch(`http://localhost:9008/api/advertisements?section=global&type=horizontal&_t=${Date.now()}`);
    const data = await response.json();
    
    console.log('🌐 Anuncios Globales:');
    console.log(`   Anuncios encontrados: ${data.advertisements?.length || 0}`);
    
    if (data.advertisements?.length > 0) {
      data.advertisements.forEach((ad: any, index: number) => {
        console.log(`   ${index + 1}. ${ad.name} (${ad.is_active ? '✅ Activo' : '❌ Inactivo'})`);
      });
    }
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error verificando anuncios globales: ${error}`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkAdsIntegration()
    .then(() => {
      console.log('✅ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en verificación:', error);
      process.exit(1);
    });
}