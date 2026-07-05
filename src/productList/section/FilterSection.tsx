import { useEffect, useState, type ChangeEvent } from 'react';
import type { FilterValues, SortBy } from '../types';
import { CATEGORIES, FILTER_DEBOUNCE_MS, SORT_OPTIONS } from '../types';
import { Checkbox } from '@/common/components/Checkbox';

type FilterSectionProps = {
  /** 필터 값 */
  filter: FilterValues;
  /** 필터 값이 바뀔 때 호출 (viewMode 제외) */
  onFilterChange: (values: FilterValues) => void;
  /** 필터 초기화 */
  onResetFilter: () => void;
  /** 보기 모드 현재 값 */
  viewMode: 'grid' | 'list';
  /** 보기 모드 변경 시 호출 */
  onViewModeChange: (mode: 'grid' | 'list') => void;
};

export function FilterSection({
  filter,
  onFilterChange,
  onResetFilter,
  viewMode,
  onViewModeChange,
}: FilterSectionProps) {
  const [searchInput, setSearchInput] = useState(filter.searchQuery);
  const [minPriceInput, setMinPriceInput] = useState(filter.minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(filter.maxPrice);

  const [prevFilter, setPrevFilter] = useState(filter);
  if (filter !== prevFilter) {
    setPrevFilter(filter);
    setSearchInput(filter.searchQuery);
    setMinPriceInput(filter.minPrice);
    setMaxPriceInput(filter.maxPrice);
  }

  const update = (patch: Partial<FilterValues>) => {
    const next = { ...filter, ...patch };
    onFilterChange(next);
  };

  useEffect(() => {
    const isUnchanged =
      searchInput === filter.searchQuery &&
      minPriceInput === filter.minPrice &&
      maxPriceInput === filter.maxPrice;
    if (isUnchanged) return;

    const timer = setTimeout(() => {
      onFilterChange({
        ...filter,
        searchQuery: searchInput,
        minPrice: minPriceInput,
        maxPrice: maxPriceInput,
      });
    }, FILTER_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput, minPriceInput, maxPriceInput, filter, onFilterChange]);

  const handleCategoryChange = (category: FilterValues['category']) => update({ category });

  const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMinPriceInput(e.target.value === '' ? '' : Number(e.target.value));

  const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMaxPriceInput(e.target.value === '' ? '' : Number(e.target.value));

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) =>
    update({ sortBy: e.target.value as SortBy });

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value);

  const handleInStockToggle = (e: ChangeEvent<HTMLInputElement>) =>
    update({ inStockOnly: e.target.checked });

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
              value={minPriceInput}
              onChange={handleMinPriceChange}
              min={0}
            />
            <span>~</span>
            <input
              type="number"
              placeholder="최대"
              value={maxPriceInput}
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

        <button className="reset-button" onClick={onResetFilter}>
          필터 초기화
        </button>
      </section>

      <section className="search-sort">
        <input
          type="search"
          placeholder="상품 검색..."
          value={searchInput}
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
