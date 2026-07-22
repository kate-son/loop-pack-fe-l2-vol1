import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createWebStorage } from '@/shared/lib/webStorage';
import { setReplacer, setReviver, toggleSetItem } from '@/shared/lib/set';

type WishlistState = { productIds: Set<string> };

type WishlistActions = {
  setSingleIdInWishlist: (productId: string) => void;
};

type WishlistStore = WishlistState & WishlistActions;

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set) => ({
      productIds: new Set<string>(),
      setSingleIdInWishlist: (productId: string) => {
        set((state) => ({
          productIds: toggleSetItem<string>(state.productIds, productId),
        }));
      },
    }),
    {
      name: 'WISH_LIST_STORE',
      storage: createJSONStorage(() => createWebStorage('sessionStorage'), {
        replacer: setReplacer,
        reviver: setReviver,
      }),
      skipHydration: true,
    },
  ),
);
