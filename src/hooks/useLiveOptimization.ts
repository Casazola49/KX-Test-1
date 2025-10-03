'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getOptimizedPollingInterval, 
  shouldUpdateChat, 
  isSlowConnection,
  handleConnectionChange,
  optimizeIframePerformance
} from '@/lib/live-optimizations';

// Hook para optimizar el polling de configuración de live stream
export function useOptimizedLivePolling(baseInterval: number = 10000) {
  const [interval, setInterval] = useState(baseInterval);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Ajustar intervalo basado en la conexión
    const optimizedInterval = getOptimizedPollingInterval(baseInterval);
    setInterval(optimizedInterval);

    // Manejar cambios de conexión
    const cleanup = handleConnectionChange(setIsOnline);

    return cleanup;
  }, [baseInterval]);

  return { interval: isOnline ? interval : interval * 2, isOnline };
}

// Hook para optimizar el chat en tiempo real
export function useOptimizedChatPolling(baseInterval: number = 5000) {
  const [shouldPoll, setShouldPoll] = useState(true);
  const [interval, setInterval] = useState(baseInterval);

  useEffect(() => {
    const checkShouldUpdate = () => {
      const should = shouldUpdateChat();
      setShouldPoll(should);
    };

    // Verificar inicialmente
    checkShouldUpdate();

    // Verificar cuando cambia la visibilidad
    document.addEventListener('visibilitychange', checkShouldUpdate);

    // Ajustar intervalo basado en la conexión
    const optimizedInterval = getOptimizedPollingInterval(baseInterval);
    setInterval(optimizedInterval);

    return () => {
      document.removeEventListener('visibilitychange', checkShouldUpdate);
    };
  }, [baseInterval]);

  return { shouldPoll, interval };
}

// Hook para optimizar el iframe del live stream
export function useOptimizedIframe() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleIframeLoad = useCallback(() => {
    setIsLoaded(true);
    if (iframeRef.current) {
      optimizeIframePerformance(iframeRef.current);
    }
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      return () => iframe.removeEventListener('load', handleIframeLoad);
    }
  }, [handleIframeLoad]);

  return { iframeRef, isLoaded };
}

// Hook para detectar conexión lenta y ajustar la experiencia
export function useConnectionOptimization() {
  const [isSlowConn, setIsSlowConn] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const updateConnectionInfo = () => {
      setIsSlowConn(isSlowConnection());
      
      const connection = (navigator as any).connection;
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };

    // Verificar inicialmente
    updateConnectionInfo();

    // Escuchar cambios de conexión
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
      return () => connection.removeEventListener('change', updateConnectionInfo);
    }
  }, []);

  return { isSlowConnection: isSlowConn, connectionType };
}

// Hook para optimizar las animaciones del live stream
export function useLiveAnimationOptimization() {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLowEndDevice = (navigator as any).deviceMemory < 4;
    
    setShouldAnimate(!prefersReducedMotion && !isLowEndDevice);
  }, []);

  return { shouldAnimate };
}

// Hook para gestionar el estado de carga optimizado
export function useOptimizedLoadingState() {
  const [loadingStates, setLoadingStates] = useState({
    config: true,
    chat: true,
    iframe: true
  });

  const setLoadingState = useCallback((key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return { loadingStates, setLoadingState, isAnyLoading };
}

// Hook para optimizar el scroll del chat
export function useOptimizedChatScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current && shouldAutoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [shouldAutoScroll]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    setShouldAutoScroll(isAtBottom);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return { scrollRef, scrollToBottom, shouldAutoScroll };
}