import { useEffect, useState } from 'react';
import { getLocalStorage, setLocalStorage } from '@/utils.ts';

export function useWishList() {
  const [wishlist, setWishlist] = useState<number[]>(() => getLocalStorage('wishlist', []));

  useEffect(() => {
    setLocalStorage<number[]>('wishlist', wishlist);
  }, [wishlist]);

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  return { wishlist, toggleWishlist };
}
