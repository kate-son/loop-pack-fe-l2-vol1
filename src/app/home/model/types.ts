import type { Category } from '@/entities/category/model/category';
import type { Product } from '@/entities/product/model/product';

export type HomeResponse = {
  banner: { title: string; description: string; image: string };
  categories: Category[];
  popularProducts: Product[];
  newProducts: Product[];
};
