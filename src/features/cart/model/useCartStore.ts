import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createWebStorage } from '@/shared/lib/webStorage';
import { setReplacer, setReviver, toggleSetItem } from '@/shared/lib/set';

type CartState = { productIds: Set<string> };

type CartActions = {
  setSingleIdInCart: (productId: string) => void;
};

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      productIds: new Set<string>(),
      setSingleIdInCart: (productId: string) => {
        set((state) => ({
          productIds: toggleSetItem<string>(state.productIds, productId),
        }));
      },
    }),
    {
      name: 'CART_STORE',
      storage: createJSONStorage(() => createWebStorage('sessionStorage'), {
        replacer: setReplacer,
        reviver: setReviver,
      }),
      skipHydration: true,
    },
  ),
);
