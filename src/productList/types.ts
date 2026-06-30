export type Product = {
  id: number;
  name: string;
  category: 'electronics' | 'fashion' | 'home' | 'beauty';
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string;
  createdAt: string;
  rating: number;
  reviewCount: number;
};

export type ProductListResponse = {
  products: Product[];
  totalCount: number;
};

export type SortBy = 'latest' | 'popular' | 'price-asc' | 'price-desc';

export type FilterValues = {
  category: 'all' | Product['category'];
  minPrice: number | '';
  maxPrice: number | '';
  sortBy: SortBy;
  searchQuery: string;
  inStockOnly: boolean;
};

export const CATEGORIES: { value: 'all' | Product['category']; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'electronics', label: '전자제품' },
  { value: 'fashion', label: '패션' },
  { value: 'home', label: '홈' },
  { value: 'beauty', label: '뷰티' },
];

export const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'price-asc', label: '가격 낮은순' },
  { value: 'price-desc', label: '가격 높은순' },
];

export const PAGE_SIZE = 12;
export const MAX_RECENTLY_VIEWED = 10;
export const NEW_PRODUCT_DAYS = 7;
export const HOT_DISCOUNT_RATE = 30;
export const BEST_MIN_RATING = 4.5;
export const BEST_MIN_REVIEW_COUNT = 100;
export const FREE_SHIPPING_THRESHOLD = 50000;
export const ALMOST_SOLD_OUT_STOCK = 5;
export const PAGINATION_RANGE = 2;
export const MS_PER_DAY = 1000 * 60 * 60 * 24;
