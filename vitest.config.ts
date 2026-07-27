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
            'src/features/wishlist/model/useWishlistStore.test.ts',
            'src/widgets/product-card/ui/ProductCard.test.tsx',
            'src/widgets/header/ui/Header.test.tsx',
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
            'src/features/wishlist/model/useWishlistStore.test.ts',
            'src/widgets/product-card/ui/ProductCard.test.tsx',
            'src/widgets/header/ui/Header.test.tsx',
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
