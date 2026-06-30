import { useState } from 'react';
import type { Product, SortBy, FilterValues } from '../types';
import { CATEGORIES, SORT_OPTIONS } from '../types';

type FilterSectionProps = {
  /** 필터 값이 바뀔 때 호출 (viewMode 제외) */
  onFilterChange: (values: FilterValues) => void;
  /** 보기 모드 현재 값 */
  viewMode: 'grid' | 'list';
  /** 보기 모드 변경 시 호출 */
  onViewModeChange: (mode: 'grid' | 'list') => void;
};

export function FilterSection({ onFilterChange, viewMode, onViewModeChange }: FilterSectionProps) {
  const [category, setCategory] = useState<'all' | Product['category']>('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<SortBy>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  const handleCategoryChange = (cat: 'all' | Product['category']) => {
    setCategory(cat);
    onFilterChange({ category: cat, minPrice, maxPrice, sortBy, searchQuery, inStockOnly });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value === '' ? '' : Number(e.target.value);
    setMinPrice(v);
    onFilterChange({ category, minPrice: v, maxPrice, sortBy, searchQuery, inStockOnly });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value === '' ? '' : Number(e.target.value);
    setMaxPrice(v);
    onFilterChange({ category, minPrice, maxPrice: v, sortBy, searchQuery, inStockOnly });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as SortBy;
    setSortBy(v);
    onFilterChange({ category, minPrice, maxPrice, sortBy: v, searchQuery, inStockOnly });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchQuery(v);
    onFilterChange({ category, minPrice, maxPrice, sortBy, searchQuery: v, inStockOnly });
  };

  const handleInStockToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.checked;
    setInStockOnly(v);
    onFilterChange({ category, minPrice, maxPrice, sortBy, searchQuery, inStockOnly: v });
  };

  const handleResetFilters = () => {
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('latest');
    setSearchQuery('');
    setInStockOnly(false);
    onFilterChange({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'latest',
      searchQuery: '',
      inStockOnly: false,
    });
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
                className={category === cat.value ? 'active' : ''}
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
              value={minPrice}
              onChange={handleMinPriceChange}
              min={0}
            />
            <span>~</span>
            <input
              type="number"
              placeholder="최대"
              value={maxPrice}
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
            <input type="checkbox" checked={inStockOnly} onChange={handleInStockToggle} />
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
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select value={sortBy} onChange={handleSortChange}>
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
