# Guía de Configuración: Firebase + Cloudinary

## 1. Configurar Firebase (GRATIS)

### Paso 1: Crear proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Crear proyecto"
3. Nombre: `tu-proyecto-karting`
4. Desactiva Google Analytics (opcional)
5. Clic en "Crear proyecto"

### Paso 2: Configurar Firestore
1. En el menú lateral → "Firestore Database"
2. Clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba"
4. Elige ubicación (us-central1 recomendado)

### Paso 3: Configurar Authentication
1. En el menú lateral → "Authentication"
2. Pestaña "Sign-in method"
3. Habilita los métodos que necesites:
   - Email/Password
   - Google (opcional)

### Paso 4: Obtener configuración
1. Configuración del proyecto (ícono engranaje)
2. "Configuración del proyecto"
3. Scroll down → "Tus apps"
4. Clic en "Web" (</>) 
5. Registra la app: `tu-proyecto-karting-web`
6. Copia la configuración

## 2. Configurar Cloudinary (GRATIS)

### Paso 1: Crear cuenta
1. Ve a [Cloudinary](https://cloudinary.com/users/register/free)
2. Regístrate con email (NO requiere tarjeta)
3. Verifica tu email

### Paso 2: Obtener credenciales
1. Dashboard → "Settings" → "API Keys"
2. Copia:
   - Cloud Name
   - API Key  
   - API Secret

### Paso 3: Crear Upload Preset
1. Settings → "Upload"
2. Scroll down → "Upload presets"
3. Clic "Add upload preset"
4. Configuración:
   - Preset name: `ml_default` o `tu_preset_name`
   - Signing Mode: "Unsigned"
   - Folder: `uploads` (opcional)
5. Guarda

## 3. Configurar Variables de Entorno

Crea archivo `.env.local` en la raíz del proyecto:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default

# Supabase (mantener durante migración)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## 4. Ejecutar Migración

```bash
# Instalar dependencias
npm install

# Ejecutar migración
node scripts/migrate-from-supabase.js
```

## 5. Verificar Migración

1. Revisa Firebase Console → Firestore
2. Revisa Cloudinary Dashboard → Media Library
3. Prueba la aplicación

## Límites Gratuitos

### Firebase (Plan Spark)
- ✅ Firestore: 1GB almacenamiento
- ✅ 50K lecturas/día, 20K escrituras/día
- ✅ Authentication: Ilimitado
- ✅ Hosting: 10GB/mes

### Cloudinary (Plan Free)
- ✅ 25GB almacenamiento
- ✅ 25GB ancho de banda/mes
- ✅ 25,000 transformaciones/mes
- ✅ CDN global incluido

## Próximos Pasos

1. ✅ Configurar Firebase y Cloudinary
2. ✅ Ejecutar migración de datos
3. 🔄 Actualizar código (siguiente fase)
4. 🔄 Probar funcionalidades
5. 🔄 Remover Supabase