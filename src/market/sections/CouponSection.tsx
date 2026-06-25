import type { Coupon } from '../types/coupon.types';
import { Section } from '../../common/components/Section.tsx';

type Props = {
  couponCode: string;
  onCouponCodeChange: (code: string) => void;
  appliedCoupon: Coupon | null;
  onApply: () => void;
};

export function CouponSection({ couponCode, onCouponCodeChange, appliedCoupon, onApply }: Props) {
  return (
    <Section title={'쿠폰'}>
      <div className="row">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => onCouponCodeChange(e.target.value)}
          placeholder="쿠폰 코드 (예: WELCOME5000)"
        />
        <button onClick={onApply}>적용</button>
      </div>
      {appliedCoupon ? <small>{appliedCoupon.label} 적용됨</small> : null}
    </Section>
  );
}
