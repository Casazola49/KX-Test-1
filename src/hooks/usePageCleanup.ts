"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UsePageCleanupOptions {
  onCleanup?: () => void;
  enabled?: boolean;
}

/**
 * Hook to handle cleanup when navigating away from a page
 * Useful for cleaning up real-time connections, subscriptions, etc.
 */
export function usePageCleanup(options: UsePageCleanupOptions = {}) {
  const { onCleanup, enabled = true } = options;
  const router = useRouter();
  const cleanupRef = useRef<(() => void) | null>(null);
  const isCleanedUpRef = useRef(false);

  // Store cleanup function
  cleanupRef.current = onCleanup || null;

  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (!isCleanedUpRef.current && cleanupRef.current) {
        console.log('🧹 Page cleanup triggered by beforeunload');
        cleanupRef.current();
        isCleanedUpRef.current = true;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isCleanedUpRef.current && cleanupRef.current) {
        console.log('🧹 Page cleanup triggered by visibility change');
        cleanupRef.current();
        isCleanedUpRef.current = true;
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (!isCleanedUpRef.current && cleanupRef.current) {
        console.log('🧹 Page cleanup triggered by component unmount');
        cleanupRef.current();
        isCleanedUpRef.current = true;
      }
    };
  }, [enabled]);

  // Manual cleanup function
  const cleanup = () => {
    if (!isCleanedUpRef.current && cleanupRef.current) {
      console.log('🧹 Manual page cleanup triggered');
      cleanupRef.current();
      isCleanedUpRef.current = true;
    }
  };

  return { cleanup };
}