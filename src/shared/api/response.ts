export type MockApiScenario = 'empty' | 'error';

export type ApiErrorResponse = {
  message: string;
};

const DEFAULT_DEV_PORT = 3000;

/** 서버(Server Component 등)에서 실행될 땐 상대경로를 못 풀어서 절대경로로 바꿔준다 */
function resolveUrl(path: string): string {
  if (typeof window !== 'undefined') {
    return path;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:${DEFAULT_DEV_PORT}`;
  return `${baseUrl}${path}`;
}

export async function apiResponseResult(url: string) {
  const res = await fetch(resolveUrl(url));

  if (!res.ok) {
    const body: ApiErrorResponse = await res.json();
    throw new Error(body.message);
  }

  return res.json();
}
