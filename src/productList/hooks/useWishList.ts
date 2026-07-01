import { useEffect, useState } from 'react';
import { getLocalStorage, setLocalStorage } from '../../utils';

export function useWishList() {
  const [wishlist, setWishlist] = useState<number[]>(() => getLocalStorage('wishlist', []));

  useEffect(() => {
    setLocalStorage('wishlist', wishlist);
  }, [wishlist]);

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  return { wishlist, toggleWishlist };
}
