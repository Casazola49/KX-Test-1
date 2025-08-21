"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

interface UseRealtimeConnectionOptions {
  channelName: string;
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

interface ConnectionState {
  status: ConnectionStatus;
  error: string | null;
  retryCount: number;
  lastConnected: Date | null;
}

export function useRealtimeConnection(options: UseRealtimeConnectionOptions) {
  const {
    channelName,
    enabled = true,
    maxRetries = 5,
    retryDelay = 1000,
    onConnectionChange
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    error: null,
    retryCount: 0,
    lastConnected: null
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  // Initialize Supabase client
  useEffect(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
  }, []);

  const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
    setConnectionState(prev => {
      const newState = { ...prev, ...updates };
      onConnectionChange?.(newState.status);
      return newState;
    });
  }, [onConnectionChange]);

  const calculateRetryDelay = useCallback((retryCount: number) => {
    // Exponential backoff with jitter
    const baseDelay = retryDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 0.1 * baseDelay;
    return Math.min(baseDelay + jitter, 30000); // Max 30 seconds
  }, [retryDelay]);

  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (channelRef.current && supabaseRef.current) {
      try {
        // Unsubscribe from all events before removing channel
        channelRef.current.unsubscribe();
        supabaseRef.current.removeChannel(channelRef.current);
        console.log(`🔌 Channel ${channelName} removed successfully`);
      } catch (error) {
        console.warn(`⚠️ Error removing channel ${channelName}:`, error);
      } finally {
        channelRef.current = null;
      }
    }
  }, [channelName]);

  const connect = useCallback(async () => {
    if (!supabaseRef.current || !enabled) return null;

    cleanup();

    updateConnectionState({ 
      status: connectionState.retryCount > 0 ? 'reconnecting' : 'connecting',
      error: null 
    });

    try {
      const channel = supabaseRef.current.channel(channelName);
      channelRef.current = channel;

      // Set up connection event handlers
      channel.subscribe((status) => {
        console.log(`🔌 Connection status for ${channelName}:`, status);
        
        switch (status) {
          case 'SUBSCRIBED':
            updateConnectionState({
              status: 'connected',
              error: null,
              retryCount: 0,
              lastConnected: new Date()
            });
            break;
          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
          case 'CLOSED':
            if (connectionState.retryCount < maxRetries) {
              const delay = calculateRetryDelay(connectionState.retryCount);
              updateConnectionState({
                status: 'reconnecting',
                error: `Connection lost, retrying in ${Math.round(delay / 1000)}s...`,
                retryCount: connectionState.retryCount + 1
              });
              
              retryTimeoutRef.current = setTimeout(() => {
                connect();
              }, delay);
            } else {
              updateConnectionState({
                status: 'error',
                error: 'Max retries exceeded. Please refresh the page.'
              });
            }
            break;
        }
      });

      return channel;
    } catch (error) {
      console.error(`❌ Failed to connect to ${channelName}:`, error);
      updateConnectionState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Connection failed'
      });
      return null;
    }
  }, [channelName, enabled, connectionState.retryCount, maxRetries, calculateRetryDelay, cleanup, updateConnectionState]);

  const disconnect = useCallback(() => {
    cleanup();
    updateConnectionState({
      status: 'disconnected',
      error: null,
      retryCount: 0
    });
  }, [cleanup, updateConnectionState]);

  const reconnect = useCallback(() => {
    updateConnectionState({ retryCount: 0 });
    connect();
  }, [connect, updateConnectionState]);

  // Auto-connect when enabled
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return cleanup;
  }, [enabled, connect, disconnect, cleanup]);

  // Cleanup on unmount and route changes
  useEffect(() => {
    return () => {
      console.log(`🧹 Cleaning up realtime connection for ${channelName}`);
      cleanup();
    };
  }, [cleanup, channelName]);

  return {
    channel: channelRef.current,
    connectionState,
    connect,
    disconnect,
    reconnect,
    isConnected: connectionState.status === 'connected',
    isConnecting: connectionState.status === 'connecting' || connectionState.status === 'reconnecting'
  };
}