/**
 * Configuration for real-time connections
 * Centralized settings for Supabase real-time subscriptions
 */

export const REALTIME_CONFIG = {
  // Connection settings
  maxRetries: 5,
  retryDelay: 2000,
  connectionTimeout: 10000,
  
  // Channel names
  channels: {
    liveStream: 'live_stream_settings_sync',
    liveChat: 'live_chat_messages_sync',
    adminChat: 'admin_live_chat'
  },
  
  // Message limits
  chatMessageLimit: 100,
  adminChatMessageLimit: 50,
  
  // Auto-scroll settings
  autoScroll: true,
  scrollThreshold: 100, // pixels from bottom
  
  // Performance settings
  debounceDelay: 300,
  throttleDelay: 1000,
  
  // Error handling
  showConnectionErrors: true,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
} as const;

export type RealtimeConfig = typeof REALTIME_CONFIG;