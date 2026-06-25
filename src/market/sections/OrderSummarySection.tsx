import type { Coupon } from '../types/coupon.types';
import type { Member } from '../types/member.types';
import { getPriceText } from '../../utils.ts';
import { Section } from '../../common/components/Section.tsx';
import { LineRow } from '../../common/components/LineRow.tsx';
import { PriceInfo } from '../../common/components/PriceInfo.tsx';

const VIP_DISCOUNT_RATE = 0.9;

type Props = {
  itemTotal: number;
  shippingFee: number;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  usePoint: boolean;
  pointDiscount: number;
  finalPrice: number;
  member: Member;
};

export function OrderSummarySection({
  itemTotal,
  shippingFee,
  appliedCoupon,
  couponDiscount,
  usePoint,
  pointDiscount,
  finalPrice,
  member,
}: Props) {
  const displayAmount =
    member.grade === 'VIP' ? Math.round(finalPrice * VIP_DISCOUNT_RATE) : finalPrice;

  return (
    <Section title={'결제 금액'}>
      <LineRow rightSlot={<PriceInfo amount={itemTotal} />}>
        <span>{'상품 금액'}</span>
      </LineRow>
      <LineRow rightSlot={<PriceInfo amount={shippingFee} />}>
        <span>{'배송비'}</span>
      </LineRow>
      {appliedCoupon ? (
        <LineRow rightSlot={<PriceInfo amount={couponDiscount} isDiscount />}>
          <span>{'쿠폰 할인'}</span>
          <small>{appliedCoupon.code}</small>
        </LineRow>
      ) : null}
      {usePoint ? (
        // 적립금 사용의 경우 원이 아니라 P로 표기?
        <LineRow rightSlot={<PriceInfo amount={pointDiscount} isDiscount />}>
          <span>{'적립금 사용'}</span>
        </LineRow>
      ) : null}
      <div className="total">
        <span>최종 결제 금액</span>
        <strong>{getPriceText(displayAmount)}</strong>
      </div>
    </Section>
  );
}
