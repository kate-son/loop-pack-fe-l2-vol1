const GC_TIME_MINUTES = 5;

/** 타임세일이 짧으면 25분 단위로도 돌아 가격이 자주 바뀔 수 있어 짧은 주기로 재확인한다 */
export const PRODUCT_PRICE_STALE_TIME = 60 * 1000;
export const PRODUCT_PRICE_GC_TIME = GC_TIME_MINUTES * 60 * 1000;
