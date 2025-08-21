"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, MessageSquare, Info, Users, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/supabase-js';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Simple fetch messages function
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('live_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (fetchError) throw fetchError;
      setMessages(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching chat messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple setup - only run once
  useEffect(() => {
    if (!isLive) return;

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('simple_live_chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_chat_messages'
      }, (payload) => {
        console.log('📨 New message:', payload.new);
        setMessages(prev => [...prev, payload.new as ChatMessage]);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        }, 100);
      })
      .subscribe();

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isLive]); // Only depend on isLive

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
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        {messages.map((msg) => (
          <div key={msg.id} className="bg-black/40 p-3 rounded-lg border border-white/10">
            <div className="flex items-start justify-between mb-1">
              <p className="font-bold text-primary text-sm">{msg.author || 'KX'}</p>
              <span className="text-xs text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(msg.created_at)}
              </span>
            </div>
            <p className="text-gray-200 text-sm whitespace-pre-wrap">
              {msg.message}
            </p>
          </div>
        ))}
        
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 text-sm pt-10">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Esperando el inicio del relato...</p>
            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
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
  const channelRef = useRef<any>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Simple fetch settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('live_stream')
        .select('*')
        .single();

      if (fetchError) throw fetchError;
      setSettings(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      
      // Fallback
      setSettings({
        id: 1,
        is_live: false,
        stream_title: 'Próxima Carrera',
        iframe_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simple setup - only run once
  useEffect(() => {
    if (!initialSettings) {
      fetchSettings();
    }

    // Set up real-time subscription for settings
    const channel = supabase
      .channel('simple_live_stream')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_stream'
      }, (payload) => {
        console.log('🔄 Settings updated:', payload.new);
        setSettings(payload.new as LiveStreamSettings);
        setLastUpdate(new Date());
      })
      .subscribe();

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []); // Empty dependencies - run only once

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
        <Card className="inline-block bg-black/20 border-2 border-primary/20 p-8 max-w-md">
          <CardHeader className="text-center">
            <Info className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-2xl font-bold text-white mb-4">
              Transmisión No Activa
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              La carrera en vivo aparecerá aquí cuando comience.
            </p>
            <div className="bg-black/30 rounded-lg p-4 border border-primary/20">
              <p className="text-sm text-gray-300">🏁 Próxima transmisión programada</p>
              <p className="text-primary font-semibold mt-1">
                {settings?.stream_title || 'Por anunciar'}
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              ¡Vuelve pronto para no perderte la acción!
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
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Stream principal */}
        <div className="xl:col-span-4">
          <Card className="overflow-hidden shadow-2xl bg-black/20 border-2 border-primary/20">
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
                <iframe
                  src={settings?.iframe_url || ''}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  title="Transmisión en vivo"
                  loading="eager"
                />
                
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-medium">EN DIRECTO</span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    Actualizado: {lastUpdate.toLocaleTimeString('es-ES')}
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