
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, MessageSquare, Info, Users, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLiveStreamSync } from '@/hooks/useLiveStreamSync';
import { useLiveChatSync } from '@/hooks/useLiveChatSync';
import ConnectionStatus from '@/components/shared/ConnectionStatus';
import StreamStats from '@/components/client/StreamStats';

const LiveChatFeed = ({ isLive }: { isLive: boolean }) => {
  const {
    messages,
    isLoading,
    error,
    newMessageCount,
    connectionState,
    scrollContainerRef,
    handleScroll,
    scrollToBottomManually,
    reconnect
  } = useLiveChatSync({
    enabled: isLive,
    messageLimit: 100,
    autoScroll: true
  });
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col bg-black/20 border-2 border-primary/20 backdrop-blur-xl shadow-2xl shadow-primary/10">
        <CardHeader className="border-b-2 border-primary/20 pb-3">
          <CardTitle className="flex items-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white">
            <MessageSquare className="mr-2 w-5 h-5 text-primary"/> 
            Relato en Vivo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400"
          >
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Cargando chat...</p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-black/20 border-2 border-primary/20 backdrop-blur-xl shadow-2xl shadow-primary/10">
      <CardHeader className="border-b-2 border-primary/20 pb-3">
        <CardTitle className="flex items-center justify-between text-lg font-bold">
          <div className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-primary via-white">
            <MessageSquare className="mr-2 w-5 h-5 text-primary"/> 
            Relato en Vivo
          </div>
          <div className="flex items-center gap-2">
            <ConnectionStatus
              status={connectionState.status}
              error={connectionState.error}
              lastConnected={connectionState.lastConnected}
              onReconnect={reconnect}
              className="text-xs"
            />
            {isLive && (
              <div className="flex items-center text-gray-300 text-sm">
                <Users className="w-4 h-4 mr-1" />
                <span>{Math.floor(Math.random() * 50) + 20}</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                delay: index * 0.02
              }}
              className="bg-black/40 p-3 rounded-lg border border-white/10 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <p className="font-bold text-primary text-sm">{msg.author || 'KX'}</p>
                <span className="text-xs text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(msg.created_at)}
                </span>
              </div>
              <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                {msg.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {messages.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 text-sm pt-10"
          >
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Esperando el inicio del relato...</p>
            {error && (
              <p className="text-red-400 text-xs mt-2">
                {error}
              </p>
            )}
          </motion.div>
        )}

        {/* New messages indicator */}
        {newMessageCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToBottomManually}
            className="fixed bottom-4 right-4 bg-primary text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-primary/90 transition-colors z-10"
          >
            {newMessageCount} nuevo{newMessageCount > 1 ? 's' : ''} mensaje{newMessageCount > 1 ? 's' : ''}
          </motion.button>
        )}
      </CardContent>
    </Card>
  );
};

export default function LiveStreamClient({ initialSettings }: { initialSettings: any }) {
  const {
    settings: currentSettings,
    isLoading,
    error,
    lastUpdate,
    connectionState,
    streamStatus,
    refreshSettings,
    reconnect
  } = useLiveStreamSync({
    initialSettings,
    enabled: true
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center p-8 md:p-12 flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Card className="inline-block bg-black/20 border-2 border-primary/20 backdrop-blur-xl shadow-2xl shadow-primary/10 p-8 max-w-md">
            <CardContent className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Cargando transmisión...</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error && !currentSettings) {
    return (
      <div className="text-center p-8 md:p-12 flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Card className="inline-block bg-black/20 border-2 border-red-500/20 backdrop-blur-xl shadow-2xl shadow-red-500/10 p-8 max-w-md">
            <CardHeader className="text-center">
              <div className="relative mb-6">
                <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
                <motion.div 
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-4">
                Error de Conexión
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-400 text-lg">
                No se pudo cargar la configuración de transmisión.
              </p>
              <div className="bg-black/30 rounded-lg p-4 border border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={refreshSettings}
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Reintentando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reintentar
                    </>
                  )}
                </Button>
                <Button
                  onClick={reconnect}
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  Reconectar
                </Button>
              </div>
              <ConnectionStatus
                status={connectionState.status}
                error={connectionState.error}
                lastConnected={connectionState.lastConnected}
                onReconnect={reconnect}
                showDetails={true}
                className="mx-auto"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Offline state
  if (streamStatus === 'offline') {
    return (
      <div className="text-center p-8 md:p-12 flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Card className="inline-block bg-black/20 border-2 border-primary/20 backdrop-blur-xl shadow-2xl shadow-primary/10 p-8 max-w-md">
            <CardHeader className="text-center">
              <div className="relative mb-6">
                <Info className="mx-auto h-16 w-16 text-primary" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-4">
                Transmisión No Activa
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-400 text-lg">
                La carrera en vivo aparecerá aquí cuando comience.
              </p>
              <div className="bg-black/30 rounded-lg p-4 border border-primary/20">
                <p className="text-sm text-gray-300">
                  🏁 Próxima transmisión programada
                </p>
                <p className="text-primary font-semibold mt-1">
                  {currentSettings?.stream_title || 'Por anunciar'}
                </p>
              </div>
              <p className="text-gray-500 text-sm">
                ¡Vuelve pronto para no perderte la acción!
              </p>
              <ConnectionStatus
                status={connectionState.status}
                error={connectionState.error}
                lastConnected={connectionState.lastConnected}
                onReconnect={reconnect}
                showDetails={true}
                className="mx-auto"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Preparing state
  if (streamStatus === 'preparing') {
    return (
      <div className="text-center p-8 md:p-12 flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Card className="inline-block bg-black/20 border-2 border-yellow-500/20 backdrop-blur-xl shadow-2xl shadow-yellow-500/10 p-8 max-w-md">
            <CardHeader className="text-center">
              <div className="relative mb-6">
                <Radio className="mx-auto h-16 w-16 text-yellow-500" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-4">
                Configurando Transmisión
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-400 text-lg">
                La transmisión está activada pero aún no se ha configurado el enlace.
              </p>
              <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
                <p className="text-sm text-gray-300">
                  ⚙️ Estado: Configuración pendiente
                </p>
                <p className="text-yellow-500 font-semibold mt-1">
                  {currentSettings?.stream_title || 'Transmisión en preparación'}
                </p>
              </div>
              <ConnectionStatus
                status={connectionState.status}
                error={connectionState.error}
                lastConnected={connectionState.lastConnected}
                onReconnect={reconnect}
                showDetails={true}
                className="mx-auto"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Live state - show the stream
  return (
    <div className="space-y-6">
      {/* Enhanced connection status indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm"
      >
        <div className="flex items-center gap-4">
          <ConnectionStatus
            status={connectionState.status}
            error={connectionState.error}
            lastConnected={connectionState.lastConnected}
            onReconnect={reconnect}
            showDetails={false}
          />
          <div className="text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}</span>
          </div>
        </div>
        
        {/* Manual refresh button */}
        {connectionState.status !== 'connected' && (
          <Button
            onClick={refreshSettings}
            variant="outline"
            size="sm"
            className="border-primary/20 text-primary hover:bg-primary/10"
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2 hidden sm:inline">Actualizar</span>
          </Button>
        )}
      </motion.div>

      {/* Stream Statistics */}
      <StreamStats
        isLive={streamStatus === 'live'}
        connectionStatus={connectionState.status}
        startTime={currentSettings?.updated_at ? new Date(currentSettings.updated_at) : undefined}
        className="mb-6"
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Stream principal */}
        <motion.div 
          className="xl:col-span-4" 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Card className="overflow-hidden shadow-2xl bg-black/20 border-2 border-primary/20 backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-black/50 to-black/30 border-b-2 border-primary/20">
              <CardTitle className="flex items-center justify-between text-xl text-white">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <Radio className="text-red-500 w-6 h-6" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <span>{currentSettings?.stream_title || "Transmisión en Vivo"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse"
                  >
                    EN VIVO
                  </motion.div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative">
              <motion.div 
                className="aspect-video relative bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <iframe
                  src={currentSettings?.iframe_url || ''}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  title="Transmisión en vivo"
                  loading="eager"
                  onLoad={() => console.log('✅ Iframe loaded successfully')}
                  onError={() => console.error('❌ Iframe failed to load')}
                />
                
                {/* Enhanced overlay with connection status */}
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-2 h-2 bg-red-500 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                    <span className="font-medium">EN DIRECTO</span>
                    {connectionState.status !== 'connected' && (
                      <span className="text-yellow-400 text-xs ml-2 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Reconectando...
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    Sincronizado: {lastUpdate.toLocaleTimeString('es-ES')}
                  </div>
                </div>

                {/* Connection error overlay */}
                <AnimatePresence>
                  {connectionState.status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm max-w-xs"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Error de Conexión</span>
                      </div>
                      <p className="text-xs text-red-100">
                        La sincronización se ha perdido. Los datos pueden no estar actualizados.
                      </p>
                      <Button
                        onClick={reconnect}
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-6 px-2 text-xs text-white hover:bg-white/20"
                      >
                        Reconectar
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat lateral */}
        <motion.div 
          className="xl:col-span-1" 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <div style={{ height: '600px' }}>
            <LiveChatFeed isLive={streamStatus === 'live'} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
