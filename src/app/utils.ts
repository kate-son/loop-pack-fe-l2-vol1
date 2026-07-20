import type { ApiErrorResponse } from '@/types/commerce';

export async function apiResponseResult(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    const body: ApiErrorResponse = await res.json();
    throw new Error(body.message);
  }

  return res.json();
}

type SerializedSet = { __type: 'Set'; values: unknown[] };

function isSerializedSet(value: unknown): value is SerializedSet {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__type' in value &&
    (value as { __type: unknown }).__type === 'Set'
  );
}

/** Set을 JSON으로 저장하기 전에 배열 형태로 바꾼다 (JSON.stringify는 Set을 그대로 못 다룸) */
export function setReplacer(_key: string, value: unknown) {
  return value instanceof Set ? { __type: 'Set', values: [...value] } : value;
}

/** setReplacer로 저장된 값을 다시 Set으로 복원한다 */
export function setReviver(_key: string, value: unknown) {
  return isSerializedSet(value) ? new Set(value.values) : value;
}

export function toggleSetItem<T>(set: Set<T>, item: T) {
  const newSet = new Set<T>(set);
  if (set.has(item)) {
    newSet.delete(item);
  } else {
    newSet.add(item);
  }
  return newSet;
}
