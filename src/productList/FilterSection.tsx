import type { Product, SortBy } from './types';
import { CATEGORIES, SORT_OPTIONS } from './types';

type FilterValues = {
  category: 'all' | Product['category'];
  minPrice: number | '';
  maxPrice: number | '';
  sortBy: SortBy;
  searchQuery: string;
  inStockOnly: boolean;
  viewMode: 'grid' | 'list';
};

type FilterHandlers = {
  onCategoryChange: (cat: 'all' | Product['category']) => void;
  onMinPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInStockToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetFilters: () => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
};

type FilterSectionProps = {
  /** 필터·검색·보기모드 현재 값 */
  values: FilterValues;
  /** 각 필터 변경 핸들러 */
  handlers: FilterHandlers;
};

export function FilterSection({ values, handlers }: FilterSectionProps) {
  return (
    <>
      <section className="filter-panel">
        <div className="filter-group">
          <label>카테고리</label>
          <div className="category-list">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className={values.category === cat.value ? 'active' : ''}
                onClick={() => handlers.onCategoryChange(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>가격 범위</label>
          <div className="price-range">
            <input
              type="number"
              placeholder="최소"
              value={values.minPrice}
              onChange={handlers.onMinPriceChange}
              min={0}
            />
            <span>~</span>
            <input
              type="number"
              placeholder="최대"
              value={values.maxPrice}
              onChange={handlers.onMaxPriceChange}
              min={0}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>옵션</label>
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400, fontSize: 13 }}
          >
            <input
              type="checkbox"
              checked={values.inStockOnly}
              onChange={handlers.onInStockToggle}
            />
            재고 있는 것만
          </label>
        </div>

        <button className="reset-button" onClick={handlers.onResetFilters}>
          필터 초기화
        </button>
      </section>

      <section className="search-sort">
        <input
          type="search"
          placeholder="상품 검색..."
          value={values.searchQuery}
          onChange={handlers.onSearchChange}
          className="search-input"
        />
        <select value={values.sortBy} onChange={handlers.onSortChange}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={values.viewMode}
          onChange={(e) => handlers.onViewModeChange(e.target.value as 'grid' | 'list')}
        >
          <option value="grid">그리드</option>
          <option value="list">리스트</option>
        </select>
      </section>
    </>
  );
}
