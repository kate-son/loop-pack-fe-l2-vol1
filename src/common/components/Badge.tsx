import type { InputHTMLAttributes } from 'react';

type BadgeProps = Omit<InputHTMLAttributes<HTMLSpanElement>, 'type'> & {
  /** 배지에 표시할 텍스트 */
  label: string;
  /** 배지 색상·위치를 결정 (badge-{variant} 클래스 적용) */
  variant: string;
};

export function Badge({ label, variant }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{label}</span>;
}
