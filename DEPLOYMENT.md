# 🚀 Guía de Despliegue en Vercel

## Pasos para Desplegar tu Proyecto

### 1. Preparación del Código

```bash
# Verificar que todo esté listo
npm run pre-deploy

# Ejecutar verificación completa
npm run deploy-check
```

### 2. Configurar Vercel

1. **Conectar Repositorio:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub/GitLab
   - Importa tu repositorio

2. **Configurar Variables de Entorno:**
   En el dashboard de Vercel, ve a Settings > Environment Variables y agrega:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCQ1SLjeKjW2ZXIoDjvWkbbAZBRhF-0Gs8
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kartxperience-bolivia.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=kartxperience-bolivia
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kartxperience-bolivia.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=868616057366
   NEXT_PUBLIC_FIREBASE_APP_ID=1:868616057366:web:6cbc252210e474dc9bfb37
   FIREBASE_PROJECT_ID=kartxperience-bolivia
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@kartxperience-bolivia.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=[tu_clave_privada_completa]
   NEXT_PUBLIC_SUPABASE_URL=https://nnscuagvcxqmtjncajsf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu_clave_anon]
   SUPABASE_SERVICE_ROLE_KEY=[tu_clave_service_role]
   NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
   NEXT_DISABLE_IMAGES_UPGRADE=true
   ```

### 3. Configurar Dominio Personalizado

1. **En Vercel:**
   - Ve a Settings > Domains
   - Agrega tu dominio personalizado
   - Vercel te dará los registros DNS necesarios

2. **En tu Proveedor de Dominio:**
   - Agrega los registros DNS que Vercel te proporcione
   - Típicamente será un registro CNAME o A

### 4. Configuraciones de Firebase

Asegúrate de que en Firebase Console:

1. **Authentication > Settings > Authorized domains:**
   - Agrega tu dominio personalizado
   - Ejemplo: `tu-dominio.com`

2. **Hosting (si usas Firebase Hosting):**
   - Configura redirects si es necesario

### 5. Configuraciones de Supabase

En Supabase Dashboard:

1. **Settings > API:**
   - Verifica que las URLs estén correctas

2. **Authentication > URL Configuration:**
   - Agrega tu dominio en "Site URL"
   - Agrega redirect URLs si es necesario

### 6. Verificación Post-Despliegue

Después del despliegue, verifica:

- [ ] El sitio carga correctamente
- [ ] Las imágenes se muestran
- [ ] Firebase funciona (auth, database)
- [ ] Supabase funciona
- [ ] Los formularios funcionan
- [ ] Las rutas dinámicas funcionan
- [ ] El SEO está configurado

### 7. Optimizaciones de Performance

```bash
# Analizar el bundle
npm run build:analyze

# Ver métricas de performance
npm run analyze
```

### 8. Monitoreo

- Configura alertas en Vercel
- Revisa los logs regularmente
- Monitorea Core Web Vitals

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Verificar tipos
npm run typecheck

# Linting
npm run lint

# Verificación pre-despliegue
npm run pre-deploy
```

## Troubleshooting

### Error de Build
- Verifica que todas las dependencias estén instaladas
- Revisa los tipos de TypeScript
- Verifica las variables de entorno

### Error de Variables de Entorno
- Asegúrate de que todas las variables estén configuradas en Vercel
- Verifica que las claves de Firebase/Supabase sean correctas

### Error de Dominio
- Verifica la configuración DNS
- Espera la propagación DNS (puede tomar hasta 48 horas)

## Contacto

Si tienes problemas, revisa:
1. Los logs de Vercel
2. La consola del navegador
3. Los logs de Firebase/Supabase