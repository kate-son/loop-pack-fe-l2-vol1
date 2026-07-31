import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
};

export default defineConfig({
  resolve: { alias },
  define: {
    'process.env': JSON.stringify({ NODE_ENV: 'test' }),
  },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'node',
          environment: 'node',
          exclude: [
            '**/node_modules/**',
            'src/features/product-filter/model/useProductListParams.test.tsx',
            'src/entities/wishlist/model/useWishlistStore.test.ts',
            'src/entities/cart/model/useCartStore.test.ts',
            'src/entities/product/ui/ProductCard.test.tsx',
            'src/widgets/header/ui/Header.test.tsx',
            'src/widgets/product-list-section/ui/ProductListSection.test.tsx',
            'src/features/toggle-wishlist/ui/ToggleWishlistButton.test.tsx',
            'src/features/add-to-cart/ui/AddToCartButton.test.tsx',
            'src/shared/ui/PageHeading/PageHeading.test.tsx',
            'src/app/error.test.tsx',
            'src/app/(home)/error.test.tsx',
            'src/app/products/error.test.tsx',
          ],
        },
      },
      {
        resolve: { alias },
        define: {
          'process.env': JSON.stringify({ NODE_ENV: 'test' }),
        },
        test: {
          name: 'browser',
          include: [
            'src/features/product-filter/model/useProductListParams.test.tsx',
            'src/entities/wishlist/model/useWishlistStore.test.ts',
            'src/entities/cart/model/useCartStore.test.ts',
            'src/entities/product/ui/ProductCard.test.tsx',
            'src/widgets/header/ui/Header.test.tsx',
            'src/widgets/product-list-section/ui/ProductListSection.test.tsx',
            'src/features/toggle-wishlist/ui/ToggleWishlistButton.test.tsx',
            'src/features/add-to-cart/ui/AddToCartButton.test.tsx',
            'src/shared/ui/PageHeading/PageHeading.test.tsx',
            'src/app/error.test.tsx',
            'src/app/(home)/error.test.tsx',
            'src/app/products/error.test.tsx',
          ],
          setupFiles: ['./vitest.setup.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
