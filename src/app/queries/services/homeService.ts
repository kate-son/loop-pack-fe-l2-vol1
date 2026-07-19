import type { HomeResponse } from '@/types/commerce';
import { apiResponseResult } from '@/app/utils';

export async function fetchHome(): Promise<HomeResponse> {
  return apiResponseResult('/api/home');
}
