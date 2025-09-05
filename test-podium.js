// Script de prueba para verificar qué podio se está obteniendo
const { getLatestEventWithPodiums } = require('./src/lib/data-service-simple.ts');

async function testPodium() {
  try {
    console.log('🔍 Probando la función getLatestEventWithPodiums...');
    const result = await getLatestEventWithPodiums();
    
    if (result) {
      console.log('✅ Evento encontrado:');
      console.log(`   Nombre: ${result.name}`);
      console.log(`   Fecha: ${result.event_date}`);
      console.log(`   Podiums: ${result.podiums?.length || 0}`);
      
      if (result.podiums && result.podiums.length > 0) {
        console.log('🏆 Categorías con podiums:');
        result.podiums.forEach(podium => {
          console.log(`   - ${podium.category?.name || 'Sin categoría'}: ${podium.results?.length || 0} resultados`);
        });
      }
    } else {
      console.log('❌ No se encontró ningún evento con podiums');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPodium();