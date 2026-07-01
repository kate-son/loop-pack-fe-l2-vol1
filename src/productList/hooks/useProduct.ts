import type { Product } from '../types';
import {
  HOT_DISCOUNT_RATE,
  BEST_MIN_RATING,
  BEST_MIN_REVIEW_COUNT,
  FREE_SHIPPING_THRESHOLD,
  ALMOST_SOLD_OUT_STOCK,
  NEW_PRODUCT_DAYS,
  MS_PER_DAY,
} from '../types';
import { getPriceText } from '@/utils.ts';

export function useProduct(product: Product) {
  const discountRate = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const formattedPrice = getPriceText(product.price);
  const formattedOriginal = product.originalPrice ? getPriceText(product.originalPrice) : null;
  const isSoldOut = product.stock === 0;
  const isAlmostSoldOut = product.stock > 0 && product.stock <= ALMOST_SOLD_OUT_STOCK;
  const isHot = discountRate >= HOT_DISCOUNT_RATE;
  const isBest = product.rating >= BEST_MIN_RATING && product.reviewCount >= BEST_MIN_REVIEW_COUNT;
  const isFreeShipping = product.price >= FREE_SHIPPING_THRESHOLD;
  const daysSinceCreated = Math.floor(
    (new Date().getTime() - new Date(product.createdAt).getTime()) / MS_PER_DAY,
  );
  const isNew = daysSinceCreated <= NEW_PRODUCT_DAYS;

  return {
    discountRate,
    formattedPrice,
    formattedOriginal,
    isSoldOut,
    isAlmostSoldOut,
    isHot,
    isBest,
    isFreeShipping,
    isNew,
  };
}
