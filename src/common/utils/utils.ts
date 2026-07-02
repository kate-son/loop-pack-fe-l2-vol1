/**
 * 순자를 가격 문자열로 반환
 * @param price 가격 (default: 0)
 * @param endAdornment 단위 표현 (default: 원)
 * */
export function getPriceText(price?: number, endAdornment?: string) {
  return `${(price ?? 0).toLocaleString()}${endAdornment || '원'}`;
}

/**
 * localStorage에서 값 읽기
 * @param key localStorage key
 * @param fallback 파싱 실패 또는 키 없음 시 해당 데이터 fallback
 * */
export function getLocalStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * localStorage에 값 저장(저장 불가 시 무시)
 * @param key localStorage key
 * @param value 저장 데이터
 * */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage 사용 불가 시 무시
  }
}

/**
 * 텍스트에서 searchQuery와 일치하는 부분을 기준으로 분리한 배열을 반환(대소문자 무시)
 * @param text 텍스트
 * @param  searchQuery 검색쿼리
 * */
export function highlightMatch(text: string, searchQuery: string): string[] {
  if (!searchQuery) return [text];
  return text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
}
