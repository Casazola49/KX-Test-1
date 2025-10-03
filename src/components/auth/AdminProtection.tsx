'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AdminProtectionProps {
  children: React.ReactNode;
}

export default function AdminProtection({ children }: AdminProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      // Verificar la cookie de autenticación (no-HttpOnly)
      const authCookie = Cookies.get('admin-auth');
      
      if (!authCookie || authCookie !== 'true') {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/cafesito?redirect=${encodeURIComponent(currentPath)}`;
        return;
      }
      
      console.log('✅ Autenticación válida, permitiendo acceso');
      setIsAuthenticated(true);
    };

    // Verificar inmediatamente
    checkAuth();

    // También verificar cuando la página se enfoca (por si las cookies cambiaron)
    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Mostrar loading mientras verificamos la autenticación
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (ya se redirigió)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}