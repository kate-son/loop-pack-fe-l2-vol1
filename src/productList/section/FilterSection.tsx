import { useState } from 'react';
import type { FilterValues, SortBy } from '../types';
import { CATEGORIES, SORT_OPTIONS } from '../types';
import { INITIAL_FILTER_VALUES } from '../hooks/useProductList';

type FilterSectionProps = {
  /** 필터 값이 바뀔 때 호출 (viewMode 제외) */
  onFilterChange: (values: FilterValues) => void;
  /** 보기 모드 현재 값 */
  viewMode: 'grid' | 'list';
  /** 보기 모드 변경 시 호출 */
  onViewModeChange: (mode: 'grid' | 'list') => void;
};

export function FilterSection({ onFilterChange, viewMode, onViewModeChange }: FilterSectionProps) {
  const [values, setValues] = useState<FilterValues>(INITIAL_FILTER_VALUES);

  const update = (patch: Partial<FilterValues>) => {
    const next = { ...values, ...patch };
    setValues(next);
    onFilterChange(next);
  };

  const handleCategoryChange = (category: FilterValues['category']) =>
    update({ category: category });

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ minPrice: e.target.value === '' ? '' : Number(e.target.value) });

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ maxPrice: e.target.value === '' ? '' : Number(e.target.value) });

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    update({ sortBy: e.target.value as SortBy });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ searchQuery: e.target.value });

  const handleInStockToggle = (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ inStockOnly: e.target.checked });

  const handleResetFilters = () => {
    setValues(INITIAL_FILTER_VALUES);
    onFilterChange(INITIAL_FILTER_VALUES);
  };

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
                onClick={() => handleCategoryChange(cat.value)}
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
              onChange={handleMinPriceChange}
              min={0}
            />
            <span>~</span>
            <input
              type="number"
              placeholder="최대"
              value={values.maxPrice}
              onChange={handleMaxPriceChange}
              min={0}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>옵션</label>
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400, fontSize: 13 }}
          >
            <input type="checkbox" checked={values.inStockOnly} onChange={handleInStockToggle} />
            재고 있는 것만
          </label>
        </div>

        <button className="reset-button" onClick={handleResetFilters}>
          필터 초기화
        </button>
      </section>

      <section className="search-sort">
        <input
          type="search"
          placeholder="상품 검색..."
          value={values.searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select value={values.sortBy} onChange={handleSortChange}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={viewMode}
          onChange={(e) => onViewModeChange(e.target.value as 'grid' | 'list')}
        >
          <option value="grid">그리드</option>
          <option value="list">리스트</option>
        </select>
      </section>
    </>
  );
}
