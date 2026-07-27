import type { HomeResponse } from '../model/types';
import { apiResponseResult } from '@/shared/api/response';

export async function fetchHome(): Promise<HomeResponse> {
  return apiResponseResult('/api/home');
}
