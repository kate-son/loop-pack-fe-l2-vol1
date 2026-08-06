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

  /* AI-generated : Week 7 Part 1 — next/image 전환 후에도 원본 경로(hero-original.jpg)를 그대로 src로 넘기는지 확인 */
  it('Part 1 LCP 개선 — 원본 이미지를 next/image에 그대로 넘겨 서버에서 리사이즈하게 한다', () => {
    const { container } = render(
      <PageHeading title="상품 목록" description="카테고리와 조건으로 원하는 상품을 찾아보세요." />,
    );

    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/images/week-07/hero-original.jpg');
  });

  /* AI-generated : Week 7 Part 2 — compact prop이 히어로 높이를 줄이는 CSS Module 클래스를 실제로 붙이는지 확인 */
  it('compact를 주면 축소 히어로 클래스가 추가된다', () => {
    const { container } = render(
      <PageHeading
        title="상품 목록"
        description="카테고리와 조건으로 원하는 상품을 찾아보세요."
        compact
      />,
    );

    const hero = container.querySelector('section');
    expect(hero?.className).toMatch(/heroCompact/);
  });
});
