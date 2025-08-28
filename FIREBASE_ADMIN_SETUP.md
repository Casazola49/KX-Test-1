# Configuración de Firebase Admin para Migración

Para migrar los datos reales necesitas configurar Firebase Admin SDK.

## Pasos para obtener las credenciales:

### 1. Ve a Firebase Console
- Abre: https://console.firebase.google.com/project/kx2025-5cf91
- Ve a "Configuración del proyecto" (ícono engranaje)

### 2. Crear Service Account
- Pestaña "Cuentas de servicio"
- Clic en "Generar nueva clave privada"
- Se descargará un archivo JSON

### 3. Extraer información del archivo JSON
Del archivo descargado, necesitas estos valores:

```json
{
  "client_email": "firebase-adminsdk-xxxxx@kx2025-5cf91.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
}
```

### 4. Agregar a .env.local
Añade estas líneas a tu archivo `.env.local`:

```env
# Firebase Admin (para migración)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@kx2025-5cf91.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
```

**IMPORTANTE:** 
- La clave privada debe estar entre comillas dobles
- Mantén los `\n` en la clave privada
- NO compartas estas credenciales

### 5. Instalar Firebase Admin
```bash
npm install firebase-admin
```

### 6. Ejecutar migración real
```bash
node scripts/migrate-real-data.js
```

## Alternativa más simple (si tienes problemas)

Si tienes problemas con Firebase Admin, podemos usar el método del navegador:

1. Ejecutar: `npm run dev`
2. Crear endpoint especial para migración
3. Usar desde el navegador con autenticación normal

¿Prefieres configurar Firebase Admin o usar la alternativa del navegador?