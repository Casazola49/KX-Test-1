'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  root?: Element | null;
}

export function useIntersectionObserver({
  threshold = 0,
  rootMargin = '0px',
  triggerOnce = false,
  root = null
}: UseIntersectionObserverOptions = {}) {
  const [hasIntersected, setHasIntersected] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    // Si ya se intersectó y triggerOnce está activado, no hacer nada
    if (hasIntersected && triggerOnce) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isCurrentlyIntersecting = entry.isIntersecting;
        
        setIsIntersecting(isCurrentlyIntersecting);
        
        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true);
          
          // Si triggerOnce está activado, desconectar el observer
          if (triggerOnce) {
            observer.disconnect();
          }
        }
      },
      {
        threshold,
        rootMargin,
        root
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, root, hasIntersected]);

  return {
    targetRef,
    hasIntersected,
    isIntersecting
  };
}