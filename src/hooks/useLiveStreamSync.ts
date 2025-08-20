"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRealtimeConnection } from './useRealtimeConnection';
import { supabase } from '@/lib/supabase-client';

export interface LiveStreamSettings {
  id: number;
  is_live: boolean;
  stream_title: string | null;
  iframe_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UseLiveStreamSyncOptions {
  initialSettings?: LiveStreamSettings;
  enabled?: boolean;
}

export function useLiveStreamSync(options: UseLiveStreamSyncOptions = {}) {
  const { initialSettings, enabled = true } = options;
  
  const [settings, setSettings] = useState<LiveStreamSettings | null>(initialSettings || null);
  const [isLoading, setIsLoading] = useState(!initialSettings);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Connection management for live stream settings
  const {
    channel,
    connectionState,
    reconnect,
    isConnected
  } = useRealtimeConnection({
    channelName: 'live_stream_settings_sync',
    enabled,
    maxRetries: 5,
    retryDelay: 2000,
    onConnectionChange: (status) => {
      console.log('🔄 Live stream sync connection:', status);
    }
  });

  // Fetch initial settings if not provided
  const fetchSettings = useCallback(async () => {
    if (initialSettings) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('live_stream')
        .select('*')
        .single();

      if (fetchError) throw fetchError;

      setSettings(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('❌ Error fetching live stream settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      
      // Fallback settings
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
  }, [initialSettings]);

  // Set up real-time subscription
  useEffect(() => {
    if (!channel || !isConnected) return;

    console.log('🔌 Setting up live stream settings subscription');

    const handleChanges = (payload: any) => {
      console.log('🔄 Live stream settings updated:', payload.new);
      setSettings(payload.new as LiveStreamSettings);
      setLastUpdate(new Date());
      setError(null);
    };

    channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_stream'
    }, handleChanges);

    return () => {
      if (channel) {
        console.log('🔌 Cleaning up live stream settings subscription listeners');
        // Use type assertion to bypass faulty type definitions and call the cleanup method.
        (channel as any).off('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'live_stream'
        });
      }
    };
  }, [channel, isConnected]);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Refresh settings manually
  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  // Get stream status
  const getStreamStatus = useCallback(() => {
    if (!settings) return 'loading';
    if (!settings.is_live) return 'offline';
    if (settings.is_live && !settings.iframe_url) return 'preparing';
    return 'live';
  }, [settings]);

  return {
    settings,
    isLoading,
    error,
    lastUpdate,
    connectionState,
    isConnected,
    streamStatus: getStreamStatus(),
    refreshSettings,
    reconnect
  };
}