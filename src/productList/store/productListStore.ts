import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_RECENTLY_VIEWED } from '../types';

type ProductListStore = {
  wishlist: number[];
  toggleWishlist: (id: number) => void;
  recentlyViewed: number[];
  addRecentlyViewed: (id: number) => void;
};

/* AI-generated */
export const useProductListStore = create<ProductListStore>()(
  persist(
    (set) => ({
      wishlist: [],
      toggleWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id)
            ? state.wishlist.filter((w) => w !== id)
            : [...state.wishlist, id],
        })),
      recentlyViewed: [],
      addRecentlyViewed: (id) =>
        set((state) => ({
          recentlyViewed: [id, ...state.recentlyViewed.filter((r) => r !== id)].slice(
            0,
            MAX_RECENTLY_VIEWED,
          ),
        })),
    }),
    { name: 'product-list-store' },
  ),
);
