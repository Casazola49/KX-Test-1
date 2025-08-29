# 🔧 Solución: Error "Module not found: Can't resolve 'fs'"

## 🚨 Problema
Al intentar añadir una noticia en el panel de administración, aparece el error:
```
Module not found: Can't resolve 'fs'
```

## 🔍 Causa
El error ocurre porque estábamos importando la librería `cloudinary` (que es para servidor) directamente en componentes del cliente, y esta librería intenta usar módulos de Node.js como `fs` que no están disponibles en el navegador.

## ✅ Solución Implementada

### 1. **API Route para Upload**
Creamos `/src/app/api/upload/route.ts` que maneja las subidas en el servidor:

```typescript
// /api/upload - Maneja uploads en el servidor
export async function POST(request: NextRequest) {
  // Usa cloudinary v2 en el servidor (donde sí está disponible fs)
  const result = await cloudinary.uploader.upload_stream(...)
}
```

### 2. **Función Cliente Actualizada**
Actualizamos `uploadToCloudinary` en `/src/lib/cloudinary.ts`:

```typescript
// Ahora usa fetch para llamar a nuestra API route
export const uploadToCloudinary = async (file: File, folder: string) => {
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
}
```

### 3. **Variables de Entorno**
Verificamos que estén configuradas en `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## 🧪 Cómo Probar la Solución

### Opción 1: Página de Prueba
1. Ve a `/test-upload` en tu navegador
2. Selecciona una imagen
3. Haz clic en "Upload"
4. Verifica que se suba correctamente

### Opción 2: Panel de Admin
1. Ve a `/admin/add-news`
2. Llena el formulario
3. Sube una imagen
4. Verifica que no aparezca el error de `fs`

## 🔄 Pasos para Reiniciar

Si el error persiste:

1. **Detén el servidor de desarrollo** (Ctrl+C)
2. **Reinicia el servidor**:
   ```bash
   npm run dev
   # o
   yarn dev
   ```
3. **Limpia la caché** si es necesario:
   ```bash
   rm -rf .next
   npm run dev
   ```

## 📋 Verificación Final

Ejecuta este comando para verificar la configuración:
```bash
node scripts/test-cloudinary-upload.js
```

## 🎯 Resultado Esperado

- ✅ No más errores de "Module not found: Can't resolve 'fs'"
- ✅ Las imágenes se suben correctamente a Cloudinary
- ✅ Los formularios del admin funcionan sin problemas
- ✅ Las URLs de las imágenes se guardan en Firebase

## 🔗 Arquitectura Final

```
Cliente (Navegador)
    ↓ uploadToCloudinary()
API Route (/api/upload)
    ↓ cloudinary.uploader.upload_stream()
Cloudinary CDN
    ↓ secure_url
Firebase Firestore (guardar URL)
```

---

**Estado**: ✅ SOLUCIONADO
**Fecha**: $(date)
**Próximo paso**: Probar todos los formularios del admin