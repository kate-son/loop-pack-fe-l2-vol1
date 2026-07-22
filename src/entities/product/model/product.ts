import type { Category, CategoryId } from '@/entities/category/model/category';

export const PRODUCT_SORTS = ['latest', 'popular', 'price-asc', 'price-desc'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type Product = {
  id: string;
  brand: string;
  name: string;
  category: CategoryId;
  price: number;
  originalPrice: number | null;
  image: string;
  freeShipping: boolean;
  sizes: Array<{ value: number; stock: number }>;
  rating: number;
  reviewCount: number;
  createdAt: string;
};

export type ProductListQuery = {
  q?: string;
  category?: CategoryId | 'all';
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export type ProductListResponse = {
  products: Product[];
  categories: Category[];
  totalCount: number;
  page: number;
  pageSize: number;
};
