"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, MessageSquare, Info, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveStreamSettings {
  id: number;
  is_live: boolean;
  stream_title: string | null;
  iframe_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  message: string;
  author: string;
  created_at: string;
}

const SimpleLiveChatFeed = ({ isLive }: { isLive: boolean }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simple fetch messages function using Firebase (solo últimos 20 mensajes)
  const fetchMessages = async () => {
    try {
      const { getChatMessages } = await import('@/lib/data-service');
      const data = await getChatMessages(20); // Limitar a 20 mensajes
      
      // Solo actualizar si hay cambios
      if (JSON.stringify(messages) !== JSON.stringify(data)) {
        setMessages(data || []);
      }
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching chat messages:', err);
      if (!messages.length) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      }
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  // Optimized setup con polling inteligente (cada 5 segundos para tiempo real)
  useEffect(() => {
    if (!isLive) return;

    fetchMessages();

    // Polling para el chat (5 segundos)
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 5000); // 5 segundos para actualizaciones

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [isLive]); // Solo depende de isLive

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col bg-black/20 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MessageSquare className="mr-2 w-5 h-5 text-primary"/> 
            Relato en Vivo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Cargando chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-black/20 border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <MessageSquare className="mr-2 w-5 h-5 text-primary"/> 
          Relato en Vivo
        </CardTitle>
      </CardHeader>
      
      <CardContent 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 live-chat-container chat-scroll-container"
        style={{ maxHeight: '550px' }}
      >
        {messages.length > 0 ? (
          <>
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className="bg-black/40 p-3 rounded-lg border border-white/10 chat-message hover:bg-black/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-bold text-primary text-sm flex items-center">
                    <Radio className="w-3 h-3 mr-1 text-red-500" />
                    {msg.author || 'KX'}
                  </p>
                  <span className="text-xs text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1 live-icon" />
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <p className="text-gray-200 text-sm whitespace-pre-wrap chat-message-text leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))}
            <div className="text-center text-gray-500 text-xs py-2 border-t border-white/5 mt-2">
              📡 Actualizando cada 5 segundos
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 text-sm pt-10">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
            <p className="font-semibold">Esperando el inicio del relato...</p>
            <p className="text-xs text-gray-500 mt-2">Los comentarios aparecerán aquí durante la carrera</p>
            {error && (
              <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
                {error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function SimpleLiveStreamClient({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState<LiveStreamSettings | null>(initialSettings);
  const [isLoading, setIsLoading] = useState(!initialSettings);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Simple fetch settings using Firebase
  const fetchSettings = async () => {
    try {
      const { getLiveStreamConfig } = await import('@/lib/data-service');
      const data = await getLiveStreamConfig();
      
      if (data) {
        // Solo actualizar si hay cambios reales
        const newSettings = {
          id: 1,
          is_live: data.is_live,
          stream_title: data.stream_title,
          iframe_url: data.iframe_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Comparar para evitar re-renders innecesarios
        if (JSON.stringify(settings) !== JSON.stringify(newSettings)) {
          setSettings(newSettings);
          setLastUpdate(new Date());
        }
      }
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching settings:', err);
      if (!settings) {
        setError(err instanceof Error ? err.message : 'Failed to fetch settings');
        // Fallback solo si no hay settings
        setSettings({
          id: 1,
          is_live: false,
          stream_title: 'Próxima Carrera',
          iframe_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  // Optimized setup con polling inteligente
  useEffect(() => {
    // Solo hacer polling si ya tenemos settings iniciales
    if (!initialSettings) {
      fetchSettings();
      return;
    }

    // Set up polling cada 30 segundos para no sobrecargar
    const intervalId = setInterval(() => {
      fetchSettings();
    }, 30000); // 30 segundos

    return () => clearInterval(intervalId);
  }, []); // Sin dependencias para evitar loops

  // Get stream status
  const getStreamStatus = () => {
    if (!settings) return 'loading';
    if (!settings.is_live) return 'offline';
    if (settings.is_live && !settings.iframe_url) return 'preparing';
    return 'live';
  };

  const streamStatus = getStreamStatus();

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center p-8 md:p-12 flex items-center justify-center min-h-[60vh]">
        <Card className="inline-block bg-black/20 border-2 border-primary/20 p-8 max-w-md">
          <CardContent className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Cargando transmisión...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !settings) {
    return (
      <div className="text-center p-8 md:p-12 flex items-center justify-center min-h-[60vh]">
        <Card className="inline-block bg-black/20 border-2 border-red-500/20 p-8 max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <CardTitle className="text-2xl font-bold text-white mb-4">
              Error de Conexión
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              No se pudo cargar la configuración de transmisión.
            </p>
            <div className="bg-black/30 rounded-lg p-4 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <Button onClick={fetchSettings} className="bg-primary hover:bg-primary/90 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Offline state
  if (streamStatus === 'offline') {
    return (
      <div className="text-center p-8 md:p-12 flex items-center justify-center min-h-[60vh]">
        <Card className="inline-block bg-black/20 border-2 border-primary/20 p-8 max-w-2xl w-full">
          <CardHeader className="text-center">
            <Info className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-2xl font-bold text-white mb-4">
              Transmisión No Activa
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              La transmisión en vivo de SpeedHive/MyLaps aparecerá aquí cuando comience la carrera.
            </p>
            <div className="bg-black/30 rounded-lg p-4 border border-primary/20">
              <p className="text-sm text-gray-300">🏁 Próxima transmisión</p>
              <p className="text-primary font-semibold mt-1 text-lg">
                {settings?.stream_title || 'Por anunciar'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="text-2xl mb-2">⏱️</div>
                <p className="text-xs text-gray-400">Timing en vivo</p>
                <p className="text-sm text-white mt-1">Posiciones actualizadas</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="text-2xl mb-2">💬</div>
                <p className="text-xs text-gray-400">Relato en vivo</p>
                <p className="text-sm text-white mt-1">Comentarios en tiempo real</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-xs text-gray-400">Estadísticas</p>
                <p className="text-sm text-white mt-1">Tiempos por vuelta</p>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm mt-6">
              ¡Vuelve pronto para no perderte la acción! La página se actualizará automáticamente cuando comience la transmisión.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preparing state
  if (streamStatus === 'preparing') {
    return (
      <div className="text-center p-8 md:p-12 flex items-center justify-center min-h-[60vh]">
        <Card className="inline-block bg-black/20 border-2 border-yellow-500/20 p-8 max-w-md">
          <CardHeader className="text-center">
            <Radio className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <CardTitle className="text-2xl font-bold text-white mb-4">
              Configurando Transmisión
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              La transmisión está activada pero aún no se ha configurado el enlace.
            </p>
            <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
              <p className="text-sm text-gray-300">⚙️ Estado: Configuración pendiente</p>
              <p className="text-yellow-500 font-semibold mt-1">
                {settings?.stream_title || 'Transmisión en preparación'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Live state - show the stream
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 live-grid-container">
        {/* Stream principal */}
        <div className="xl:col-span-4">
          <Card className="overflow-hidden shadow-2xl bg-black/20 border-2 border-primary/20 live-status-card">
            <CardHeader className="bg-gradient-to-r from-black/50 to-black/30 border-b-2 border-primary/20">
              <CardTitle className="flex items-center justify-between text-xl text-white">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <Radio className="text-red-500 w-6 h-6" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                  <span>{settings?.stream_title || "Transmisión en Vivo"}</span>
                </div>
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  EN VIVO
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative">
              <div className="aspect-video relative bg-black">
                {!isIframeLoaded && (
                  <div className="absolute inset-0 iframe-loading flex items-center justify-center bg-black/80 z-10">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-400">Cargando transmisión de SpeedHive...</p>
                      <p className="text-gray-500 text-xs mt-2">MyLaps Live Timing</p>
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={settings?.iframe_url || ''}
                  className="live-stream-iframe"
                  style={{ width: '100%', height: '100%', minHeight: '500px' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  title="Transmisión en vivo"
                  onLoad={() => setIsIframeLoaded(true)}
                />
                
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm live-overlay">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse live-indicator" />
                    <span className="font-medium">EN DIRECTO</span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    SpeedHive/MyLaps Live Timing
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat lateral */}
        <div className="xl:col-span-1">
          <div style={{ height: '600px' }}>
            <SimpleLiveChatFeed isLive={streamStatus === 'live'} />
          </div>
        </div>
      </div>
    </div>
  );
}