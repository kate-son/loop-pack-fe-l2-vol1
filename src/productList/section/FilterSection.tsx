import { type ChangeEvent } from 'react';
import type { FilterValues, SortBy } from '../types';
import { CATEGORIES, SORT_OPTIONS } from '../types';
import { Checkbox } from '@/common/components/Checkbox';

type FilterSectionProps = {
  /** 필터 값 */
  filter: FilterValues;
  /** 필터 초기값 (초기화 버튼 클릭 시 사용) */
  initialValues: FilterValues;
  /** 필터 값이 바뀔 때 호출 (viewMode 제외) */
  onFilterChange: (values: FilterValues) => void;
  /** 보기 모드 현재 값 */
  viewMode: 'grid' | 'list';
  /** 보기 모드 변경 시 호출 */
  onViewModeChange: (mode: 'grid' | 'list') => void;
};

export function FilterSection({
  filter,
  initialValues,
  onFilterChange,
  viewMode,
  onViewModeChange,
}: FilterSectionProps) {
  const update = (patch: Partial<FilterValues>) => {
    const next = { ...filter, ...patch };
    onFilterChange(next);
  };

  const handleCategoryChange = (category: FilterValues['category']) =>
    update({ category: category });

  const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) =>
    update({ minPrice: e.target.value === '' ? '' : Number(e.target.value) });

  const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) =>
    update({ maxPrice: e.target.value === '' ? '' : Number(e.target.value) });

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) =>
    update({ sortBy: e.target.value as SortBy });

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    update({ searchQuery: e.target.value });

  const handleInStockToggle = (e: ChangeEvent<HTMLInputElement>) =>
    update({ inStockOnly: e.target.checked });

  const handleResetFilters = () => {
    onFilterChange(initialValues);
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
                className={filter.category === cat.value ? 'active' : ''}
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
              value={filter.minPrice}
              onChange={handleMinPriceChange}
              min={0}
            />
            <span>~</span>
            <input
              type="number"
              placeholder="최대"
              value={filter.maxPrice}
              onChange={handleMaxPriceChange}
              min={0}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>옵션</label>
          <Checkbox
            caption="재고 있는 것만"
            checked={filter.inStockOnly}
            onChange={handleInStockToggle}
          />
        </div>

        <button className="reset-button" onClick={handleResetFilters}>
          필터 초기화
        </button>
      </section>

      <section className="search-sort">
        <input
          type="search"
          placeholder="상품 검색..."
          value={filter.searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select value={filter.sortBy} onChange={handleSortChange}>
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
