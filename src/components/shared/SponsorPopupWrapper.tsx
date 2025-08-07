
"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import SponsorPopup from '@/components/shared/SponsorPopup';

const SPONSOR_AD_DELAY = 10000;

export default function SponsorPopupWrapper() {
  const [showSponsorAd, setShowSponsorAd] = useState(false);
  const pathname = usePathname();
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Reset and set timer for sponsor ad on route change
    if (adTimerRef.current) {
      clearTimeout(adTimerRef.current);
    }
    setShowSponsorAd(false);

    adTimerRef.current = setTimeout(() => {
      setShowSponsorAd(true);
    }, SPONSOR_AD_DELAY);

    // Cleanup timer on component unmount
    return () => {
      if (adTimerRef.current) {
        clearTimeout(adTimerRef.current);
      }
    };
  }, [pathname]); // Rerun effect when pathname changes

  return <SponsorPopup isOpen={showSponsorAd} onOpenChange={setShowSponsorAd} />;
}
