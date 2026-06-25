import { useState } from 'react';
import type { Coupon } from '../types/coupon.types';
import { Section } from '../../common/components/Section.tsx';
import { COUPONS } from '../data.ts';

type CouponSectionProps = {
  appliedCoupon: Coupon | null;
  onApply: (coupon: Coupon | null) => void;
};

// 쿠폰의 경우 해당 섹션이 쿠폰 리스트를 직접 들고 있다가(나중에 API로 대체 가능),
// 최종적으로 선택된 쿠폰만 CheckoutPage로 올린다.
export function CouponSection({ appliedCoupon, onApply }: CouponSectionProps) {
  const [couponCode, setCouponCode] = useState('');

  const applyCoupon = () => {
    const found = COUPONS.find((c) => c.code === couponCode.trim());
    onApply(found ?? null);
    if (!found) alert('존재하지 않는 쿠폰이에요');
  };

  return (
    <Section title="쿠폰">
      <div className="row">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="쿠폰 코드 (예: WELCOME5000)"
        />
        <button onClick={applyCoupon}>적용</button>
      </div>
      {appliedCoupon ? <small>{appliedCoupon.label} 적용됨</small> : null}
    </Section>
  );
}
