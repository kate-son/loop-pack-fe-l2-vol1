/**
 * API response unwrap (성공시: json return | 실패시: error)
 * @param res Response
 */
export function unwrapResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API 호출 실패 (status: ${res.status})`);
  return res.json();
}
