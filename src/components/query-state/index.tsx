import type { UseQueryResult } from '@tanstack/react-query';

type QueryStateProps<TData> = {
  /** useQuery의 반환값 */
  query: UseQueryResult<TData>;
  /** 로딩 중 렌더할 화면 */
  renderLoading: () => React.ReactNode;
  /** 에러 발생 시 렌더할 화면 */
  renderError: (error: Error) => React.ReactNode;
  /** 성공 시 data를 받아 렌더할 화면 */
  children: (data: TData) => React.ReactNode;
};

/* AI-generated */
export function QueryState<TData>({
  query,
  renderLoading,
  renderError,
  children,
}: QueryStateProps<TData>) {
  if (query.isPending) return renderLoading();
  if (query.isError) return renderError(query.error);
  return children(query.data);
}
