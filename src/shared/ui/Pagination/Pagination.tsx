type PaginationProps = {
  /** 현재 페이지 (1부터 시작) */
  page: number;
  /** 페이지당 항목 수 */
  pageSize: number;
  /** 전체 항목 수 */
  totalCount: number;
  /** 페이지 변경 시 호출 */
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageSize, totalCount, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <nav className="week05-pagination" aria-label="페이지 이동">
      <button type="button" disabled={!canGoPrev} onClick={() => onPageChange(page - 1)}>
        이전
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button type="button" disabled={!canGoNext} onClick={() => onPageChange(page + 1)}>
        다음
      </button>
    </nav>
  );
}
