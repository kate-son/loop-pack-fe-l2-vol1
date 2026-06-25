import type { Coupon } from '../types/coupon.types';
import { getPriceText } from '../../utils.ts';
import { Section } from '../../common/components/Section.tsx';
import { LineRow } from '../../common/components/LineRow.tsx';
import { PriceInfo } from '../../common/components/PriceInfo.tsx';

type Props = {
  itemTotal: number;
  shippingFee: number;
  appliedCoupon: Coupon | null;
  pointDiscount: number;
  membershipDiscount: number;
  finalPrice: number;
};

export function OrderSummarySection({
  itemTotal,
  shippingFee,
  appliedCoupon,
  pointDiscount,
  membershipDiscount,
  finalPrice,
}: Props) {
  return (
    <Section title={'결제 금액'}>
      <LineRow rightSlot={<PriceInfo amount={itemTotal} />}>
        <span>{'상품 금액'}</span>
      </LineRow>
      <LineRow rightSlot={<PriceInfo amount={shippingFee} />}>
        <span>{'배송비'}</span>
      </LineRow>
      {membershipDiscount > 0 ? (
        <LineRow rightSlot={<PriceInfo amount={membershipDiscount} isDiscount />}>
          <span>{'멤버십 할인'}</span>
        </LineRow>
      ) : null}
      {appliedCoupon ? (
        <LineRow rightSlot={<PriceInfo amount={appliedCoupon.discount} isDiscount />}>
          <span>{'쿠폰 할인'}</span>
          <small>{appliedCoupon.code}</small>
        </LineRow>
      ) : null}
      {pointDiscount > 0 ? (
        // 적립금 사용의 경우 원이 아니라 P로 표기?
        <LineRow rightSlot={<PriceInfo amount={pointDiscount} isDiscount />}>
          <span>{'적립금 사용'}</span>
        </LineRow>
      ) : null}
      <div className="total">
        <span>최종 결제 금액</span>
        <strong>{getPriceText(finalPrice)}</strong>
      </div>
    </Section>
  );
}
