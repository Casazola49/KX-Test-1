import { NextRequest, NextResponse } from 'next/server';

// Tipos para los datos de analytics
interface AnalyticsEvent {
  type: 'pageview' | 'event' | 'performance' | 'error';
  timestamp: number;
  url: string;
  referrer: string;
  userAgent: string;
  screenResolution: string;
  data?: Record<string, any>;
}

interface AnalyticsPayload {
  events: AnalyticsEvent[];
  deviceInfo: Record<string, any>;
}

// Función para procesar y almacenar eventos
const processEvents = async (payload: AnalyticsPayload) => {
  // Aquí puedes implementar el almacenamiento que prefieras:
  // - Base de datos local (SQLite, PostgreSQL)
  // - Archivo de logs
  // - Servicio de analytics alternativo (Plausible, Umami, etc.)
  
  console.log('📊 Analytics Events Received:', {
    eventCount: payload.events.length,
    deviceInfo: payload.deviceInfo,
    events: payload.events.map(e => ({
      type: e.type,
      url: e.url,
      data: e.data
    }))
  });
  
  // Ejemplo: Guardar en logs (en producción, usar una base de datos)
  if (process.env.NODE_ENV === 'production') {
    // Aquí implementarías el guardado real en Firebase o tu base de datos preferida
  }
};

// Handler para POST requests
export async function POST(request: NextRequest) {
  try {
    const payload: AnalyticsPayload = await request.json();
    
    // Validar payload
    if (!payload.events || !Array.isArray(payload.events)) {
      return NextResponse.json(
        { error: 'Invalid payload: events array required' },
        { status: 400 }
      );
    }
    
    // Procesar eventos
    await processEvents(payload);
    
    return NextResponse.json({ success: true, processed: payload.events.length });
    
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler para GET requests (opcional, para estadísticas)
export async function GET(request: NextRequest) {
  try {
    // Aquí podrías devolver estadísticas básicas
    // Por ejemplo, páginas más visitadas, eventos más comunes, etc.
    
    const stats = {
      message: 'Analytics API is running',
      timestamp: new Date().toISOString(),
      // En producción, aquí irían estadísticas reales
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}