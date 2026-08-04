import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeading } from './PageHeading';

/* AI-generated : PageHeading이 Home/Products 공통 Hero를 전담하도록 계약 변경 — title·description 둘 다 필수, hero 배경 이미지는 항상 렌더링 */
describe('PageHeading', () => {
  it('title을 표시한다', () => {
    render(
      <PageHeading title="상품 목록" description="카테고리와 조건으로 원하는 상품을 찾아보세요." />,
    );

    expect(screen.getByText('상품 목록')).toBeTruthy();
  });

  it('description을 함께 표시한다', () => {
    render(<PageHeading title="상품 목록" description="원하는 상품을 찾아보세요" />);

    expect(screen.getByText('원하는 상품을 찾아보세요')).toBeTruthy();
  });

  it('hero 배경 이미지를 항상 렌더링한다', () => {
    const { container } = render(
      <PageHeading title="상품 목록" description="카테고리와 조건으로 원하는 상품을 찾아보세요." />,
    );

    expect(container.querySelector('img')).toBeTruthy();
  });
});
