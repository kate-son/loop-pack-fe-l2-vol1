import { PAGINATION_RANGE } from '../types';
import { getPageNumbers } from '@/common/utils/utils.ts';

type PaginationProps = {
  /** 현재 페이지 */
  page: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 시 호출 */
  onPageChange: (page: number) => void;
};

export function PaginationSection({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages, PAGINATION_RANGE);

  return (
    <nav className="pagination">
      <button onClick={() => onPageChange(1)} disabled={page === 1} aria-label="첫 페이지">
        «
      </button>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="이전 페이지">
        ‹
      </button>
      {pageNumbers.map((p) => (
        <button key={p} className={p === page ? 'active' : ''} onClick={() => onPageChange(p)}>
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="다음 페이지"
      >
        ›
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        aria-label="마지막 페이지"
      >
        »
      </button>
    </nav>
  );
}
