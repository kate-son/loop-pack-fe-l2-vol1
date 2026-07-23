import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useProductListParams } from './useProductListParams';
import { productsQueryOptions } from '@/entities/product/api/productsQueryOptions';

/* AI-generated */
function ParamsProbe() {
  const { q, category, sort, page } = useProductListParams();
  const { queryKey } = productsQueryOptions({ q, category, sort, page });

  return <pre data-testid="probe">{JSON.stringify({ q, category, sort, page, queryKey })}</pre>;
}

function renderWithSearchParams(searchParams: string) {
  render(
    <NuqsTestingAdapter searchParams={searchParams}>
      <ParamsProbe />
    </NuqsTestingAdapter>,
  );

  return JSON.parse(screen.getByTestId('probe').textContent ?? '{}');
}

describe('useProductListParams와 query key 일치', () => {
  it('URL에 조건이 없으면 기본값으로 해석되고, 그 값이 query key에도 그대로 반영된다', () => {
    const probe = renderWithSearchParams('');

    expect(probe).toEqual({
      q: '',
      category: 'all',
      sort: 'latest',
      page: 1,
      queryKey: ['products', { q: '', category: 'all', sort: 'latest', page: 1 }],
    });
  });

  it('URL에 담긴 조건이 그대로 파싱되고, 그 값이 query key에도 동일하게 반영된다', () => {
    const probe = renderWithSearchParams('?category=casual&sort=popular&page=2&q=shoes');

    expect(probe).toEqual({
      q: 'shoes',
      category: 'casual',
      sort: 'popular',
      page: 2,
      queryKey: ['products', { q: 'shoes', category: 'casual', sort: 'popular', page: 2 }],
    });
  });
});
