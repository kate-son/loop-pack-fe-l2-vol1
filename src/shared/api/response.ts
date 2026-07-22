export type MockApiScenario = 'empty' | 'error';

export type ApiErrorResponse = {
  message: string;
};

export async function apiResponseResult(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    const body: ApiErrorResponse = await res.json();
    throw new Error(body.message);
  }

  return res.json();
}
