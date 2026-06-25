import type { ReactNode } from 'react';

type SectionProps = {
  /** 섹션 제목 */
  title?: string;
  /** 섹션 내부에 렌더링할 콘텐츠 */
  children: ReactNode;
};

export function Section({ title, children }: SectionProps) {
  return (
    <div className="section">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
