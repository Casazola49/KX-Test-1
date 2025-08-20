"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRealtimeConnection } from './useRealtimeConnection';
import { supabase } from '@/lib/supabase-client';

export interface ChatMessage {
  id: string;
  message: string;
  author: string;
  created_at: string;
  updated_at?: string;
}

interface UseLiveChatSyncOptions {
  enabled?: boolean;
  messageLimit?: number;
  autoScroll?: boolean;
}

export function useLiveChatSync(options: UseLiveChatSyncOptions = {}) {
  const { enabled = true, messageLimit = 100, autoScroll = true } = options;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessageCount, setNewMessageCount] = useState(0);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const lastMessageCountRef = useRef(0);

  // Connection management for chat messages
  const {
    channel,
    connectionState,
    reconnect,
    isConnected
  } = useRealtimeConnection({
    channelName: 'live_chat_messages_sync',
    enabled,
    maxRetries: 5,
    retryDelay: 1500,
    onConnectionChange: (status) => {
      console.log('💬 Chat sync connection:', status);
    }
  });

  // Check if user is near bottom of chat
  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const threshold = 100; // pixels from bottom
    const isNearBottom = 
      container.scrollHeight - container.scrollTop <= container.clientHeight + threshold;
    
    isNearBottomRef.current = isNearBottom;
  }, []);

  // Auto-scroll to bottom if user was near bottom
  const scrollToBottom = useCallback((force = false) => {
    if (!scrollContainerRef.current || (!autoScroll && !force)) return;
    
    if (isNearBottomRef.current || force) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [autoScroll]);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('live_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(messageLimit);

      if (fetchError) throw fetchError;

      setMessages(data || []);
      lastMessageCountRef.current = data?.length || 0;
      
      // Scroll to bottom after initial load
      setTimeout(() => scrollToBottom(true), 100);
    } catch (err) {
      console.error('❌ Error fetching chat messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [messageLimit, scrollToBottom]);

  // Set up real-time subscription
  useEffect(() => {
    if (!channel) return;

    console.log('🔌 Setting up chat messages subscription');

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_chat_messages'
      }, (payload) => {
        console.log('📨 New chat message:', payload.new);
        const newMessage = payload.new as ChatMessage;
        
        setMessages(prev => {
          const updated = [...prev, newMessage];
          if (updated.length > messageLimit) {
            return updated.slice(-messageLimit);
          }
          return updated;
        });

        if (!isNearBottomRef.current) {
          setNewMessageCount(prev => prev + 1);
        }

        setTimeout(() => scrollToBottom(), 100);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'live_chat_messages'
      }, (payload) => {
        console.log('🗑️ Chat message deleted:', payload.old);
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_chat_messages'
      }, (payload) => {
        console.log('✏️ Chat message updated:', payload.new);
        const updatedMessage = payload.new as ChatMessage;
        setMessages(prev => 
          prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
        );
      });

  }, [channel, messageLimit, scrollToBottom]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Reset new message count when user scrolls to bottom
  const handleScroll = useCallback(() => {
    checkScrollPosition();
    if (isNearBottomRef.current) {
      setNewMessageCount(0);
    }
  }, [checkScrollPosition]);

  // Scroll to bottom manually
  const scrollToBottomManually = useCallback(() => {
    scrollToBottom(true);
    setNewMessageCount(0);
  }, [scrollToBottom]);

  // Refresh messages manually
  const refreshMessages = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  // Clear all messages (admin function)
  const clearMessages = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
      
      setMessages([]);
      setNewMessageCount(0);
    } catch (err) {
      console.error('❌ Error clearing messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear messages');
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    newMessageCount,
    connectionState,
    isConnected,
    scrollContainerRef,
    handleScroll,
    scrollToBottomManually,
    refreshMessages,
    clearMessages,
    reconnect
  };
}