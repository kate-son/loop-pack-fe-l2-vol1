import { useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '@/utils.ts';
import { MAX_RECENTLY_VIEWED } from '../types';

/* AI-generated */
export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>(() =>
    getLocalStorage('recentlyViewed', []),
  );

  useEffect(() => {
    setLocalStorage<number[]>('recentlyViewed', recentlyViewed);
  }, [recentlyViewed]);

  const addRecentlyViewed = (productId: number) => {
    setRecentlyViewed((prev) =>
      [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_RECENTLY_VIEWED),
    );
  };

  return { recentlyViewed, addRecentlyViewed };
}
