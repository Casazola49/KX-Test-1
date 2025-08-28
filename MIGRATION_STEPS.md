# 🚀 Pasos de Migración: Supabase → Firebase + Cloudinary

## ✅ Preparación Completada
- [x] Firebase y Cloudinary configurados
- [x] Variables de entorno en `.env.local`
- [x] Archivos de migración creados
- [x] Estructura de datos mapeada

## 📋 Pasos a Seguir

### Paso 1: Verificar Configuración
```bash
npm run test-migration
```
Este comando verifica que todo esté configurado correctamente.

### Paso 2: Inicializar Firebase con Datos de Prueba
```bash
npm run dev
```
Luego visita: `http://localhost:9008/api/seed-firebase`

Esto creará las colecciones en Firebase con datos de prueba.

### Paso 3: Migrar Datos Reales de Supabase (Opcional)
Si tienes datos reales en Supabase que quieres migrar:
```bash
npm run migrate
```

### Paso 4: Verificar en Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Firestore Database"
4. Verifica que las colecciones estén creadas:
   - `pilots`
   - `news`
   - `tracks`
   - `raceevents`
   - `gallery`

### Paso 5: Probar Cloudinary
1. Ve a [Cloudinary Dashboard](https://cloudinary.com/console/)
2. Verifica que puedas acceder
3. Prueba subir una imagen de prueba

### Paso 6: Actualizar Código (Próxima Fase)
Una vez verificado que todo funciona, actualizaremos:
- Componentes que usen datos
- Páginas que muestren información
- Formularios de admin

## 🔍 Verificación de Estado

### Firebase Collections Status
Visita: `http://localhost:9008/api/seed-firebase` (método POST)
Para ver el estado de las colecciones.

### Archivos Importantes Creados
- ✅ `src/lib/firebase-collections.ts` - Tipos y definiciones
- ✅ `src/lib/firebase-seeding.ts` - Seeding para Firebase
- ✅ `src/lib/data-service.ts` - Servicio de datos unificado
- ✅ `src/lib/cloudinary.ts` - Configuración de Cloudinary
- ✅ `src/components/shared/CloudinaryUpload.tsx` - Componente de upload
- ✅ `src/hooks/useFirestore.ts` - Hooks para Firebase

## 🚨 Problemas Comunes

### Error: "Firebase project not found"
- Verifica `NEXT_PUBLIC_FIREBASE_PROJECT_ID` en `.env.local`
- Asegúrate de que el proyecto existe en Firebase Console

### Error: "Cloudinary credentials invalid"
- Verifica las credenciales en Cloudinary Dashboard
- Asegúrate de copiar correctamente Cloud Name, API Key y Secret

### Error: "Permission denied"
- En Firebase Console → Firestore → Rules
- Temporalmente usa: `allow read, write: if true;` (solo para desarrollo)

## 📊 Límites y Cuotas

### Firebase (Plan Gratuito)
- ✅ 1GB almacenamiento Firestore
- ✅ 50K lecturas/día, 20K escrituras/día
- ✅ 10K eliminaciones/día

### Cloudinary (Plan Gratuito)
- ✅ 25GB almacenamiento
- ✅ 25GB ancho de banda/mes
- ✅ 25,000 transformaciones/mes

## 🎯 Próximos Pasos

Una vez completada esta fase:
1. ✅ Datos migrados a Firebase
2. ✅ Archivos listos para Cloudinary
3. 🔄 Actualizar componentes (siguiente fase)
4. 🔄 Probar funcionalidades
5. 🔄 Remover dependencias de Supabase

## 💡 Consejos

- Mantén Supabase funcionando hasta confirmar que todo funciona
- Haz backups de tus datos antes de migrar
- Prueba en desarrollo antes de producción
- Los archivos multimedia se migrarán gradualmente