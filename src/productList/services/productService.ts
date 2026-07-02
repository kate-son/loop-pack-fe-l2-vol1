import type { ProductListResponse } from '../types';
import { unwrapResponse } from '@/common/utils/apiUtils.ts';

export const productService = {
  getProductList: async (params: URLSearchParams): Promise<ProductListResponse> => {
    const response = await fetch(`/api/products?${params}`);
    return unwrapResponse<ProductListResponse>(response);
  },
};
