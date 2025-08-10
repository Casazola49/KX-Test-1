const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CATEGORIES = [
  { name: '100cc JUNIOR', description: 'Categoría para pilotos junior con motores de 100cc' },
  { name: '125cc PROFESIONAL', description: 'Categoría profesional con motores de 125cc' },
  { name: 'BABY KART', description: 'Categoría para los más pequeños' },
  { name: 'F200 STANDARD', description: 'Categoría F200 estándar' },
  { name: 'F200 SUPER', description: 'Categoría F200 super' },
  { name: 'F200 MASTER', description: 'Categoría F200 master' },
  { name: 'INFANTIL 65', description: 'Categoría infantil con motores de 65cc' },
  { name: 'MASTER X30', description: 'Categoría Master X30' },
  { name: 'MINI 60', description: 'Categoría mini con motores de 60cc' },
  { name: 'PROFESIONAL T35', description: 'Categoría profesional T35' },
  { name: 'VORTEX 100', description: 'Categoría Vortex 100' },
  { name: 'F390', description: 'Categoría F390' },
  { name: 'PROMOCIONAL', description: 'Categoría promocional para nuevos pilotos' }
];

async function checkAndCreateCategories() {
  console.log('Verificando categorías existentes...');
  
  // Obtener categorías existentes
  const { data: existingCategories, error: fetchError } = await supabase
    .from('categories')
    .select('name');
    
  if (fetchError) {
    console.error('Error al obtener categorías:', fetchError);
    return;
  }
  
  const existingNames = new Set(existingCategories.map(cat => cat.name));
  console.log('Categorías existentes:', Array.from(existingNames));
  
  // Crear categorías faltantes
  const missingCategories = CATEGORIES.filter(cat => !existingNames.has(cat.name));
  
  if (missingCategories.length === 0) {
    console.log('✅ Todas las categorías ya existen');
    return;
  }
  
  console.log('Creando categorías faltantes:', missingCategories.map(c => c.name));
  
  const { error: insertError } = await supabase
    .from('categories')
    .insert(missingCategories);
    
  if (insertError) {
    console.error('Error al crear categorías:', insertError);
  } else {
    console.log('✅ Categorías creadas exitosamente');
  }
  
  // Verificar pilotos sin categoría válida
  console.log('\nVerificando pilotos...');
  const { data: pilots, error: pilotsError } = await supabase
    .from('pilots')
    .select('id, firstName, lastName, category');
    
  if (pilotsError) {
    console.error('Error al obtener pilotos:', pilotsError);
    return;
  }
  
  // Obtener todas las categorías actualizadas
  const { data: allCategories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name');
    
  if (categoriesError) {
    console.error('Error al obtener categorías actualizadas:', categoriesError);
    return;
  }
  
  const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));
  const nameToIdMap = new Map(allCategories.map(c => [c.name, c.id]));
  
  console.log('Mapa de categorías:', Object.fromEntries(categoryMap));
  
  const pilotsWithIssues = pilots.filter(pilot => {
    if (!pilot.category) return true;
    return !categoryMap.has(pilot.category);
  });
  
  if (pilotsWithIssues.length > 0) {
    console.log('\n⚠️ Pilotos con problemas de categoría:');
    pilotsWithIssues.forEach(pilot => {
      console.log(`- ${pilot.firstName} ${pilot.lastName}: categoría="${pilot.category}"`);
    });
  } else {
    console.log('✅ Todos los pilotos tienen categorías válidas');
  }
}

checkAndCreateCategories().catch(console.error);