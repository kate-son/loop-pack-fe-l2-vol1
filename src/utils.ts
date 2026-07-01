export function getPriceText(price?: number, endAdornment?: string) {
  return `${(price ?? 0).toLocaleString()}${endAdornment || '원'}`;
}

export function getLocalStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage 사용 불가 시 무시
  }
}

export function highlightMatch(text: string, searchQuery: string): string[] {
  if (!searchQuery) return [text];
  return text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
}
