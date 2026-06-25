import { useState } from 'react';
import type { Coupon } from './types/coupon.types';
import { ADDRESSES, CART, MEMBER, PAST_ORDERS } from './data';
import { DeliveryMemoSection } from './sections/DeliveryMemoSection';
import { CartSection } from './sections/CartSection';
import { CouponSection } from './sections/CouponSection';
import { PointSection } from './sections/PointSection';
import { PaymentMethodSection } from './sections/PaymentMethodSection';
import { OrderSummarySection } from './sections/OrderSummarySection';
import { TermsSection } from './sections/TermsSection';
import { RecentOrdersSection } from './sections/RecentOrdersSection';
import './market.css';
import { AddressSection } from './sections/AddressSection';
import { getPriceText } from '../utils.ts';
import {
  VIP_DISCOUNT_RATE,
  BASE_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  REMOTE_AREA_SURCHARGE,
} from './pricePolicy.ts';
import { CheckoutCompletePage } from './CheckoutCompletePage.tsx';

export function CheckoutPage() {
  const member = MEMBER;
  const cart = CART;

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null); //쿠폰
  const [pointDiscount, setPointDiscount] = useState(0); //포인트
  const [agreed, setAgreed] = useState(false); //약관 동의 여부
  const [isRemoteAddress, setIsRemoteAddress] = useState(ADDRESSES[0].isRemote); //도서산간 여부

  //결제하기 버튼 클릭 flag
  const [placed, setPlaced] = useState(false);

  // ── 배송비 정책 ──────────────────────────────
  const itemTotal = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
  let shippingFee = BASE_SHIPPING_FEE;
  if (itemTotal >= FREE_SHIPPING_THRESHOLD) shippingFee = 0;
  if (isRemoteAddress) shippingFee += REMOTE_AREA_SURCHARGE;

  // ── 멤버십 할인 정책 ──────────────────────────
  const gradeDiscountItemTotal =
    member.grade === 'VIP' ? Math.round(itemTotal * VIP_DISCOUNT_RATE) : itemTotal;
  const membershipDiscount = itemTotal - gradeDiscountItemTotal;

  // ── 쿠폰 정책 ────────────────────────────────
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;

  const finalPrice = gradeDiscountItemTotal + shippingFee - couponDiscount - pointDiscount;

  if (placed) {
    return (
      <CheckoutCompletePage finalPrice={finalPrice} goToCheckoutPage={() => setPlaced(false)} />
    );
  }

  return (
    <div className="checkout">
      <h1>주문/결제</h1>

      <AddressSection onRemoteChange={setIsRemoteAddress} />

      <DeliveryMemoSection />

      <CartSection items={cart} />

      <CouponSection appliedCoupon={appliedCoupon} onApply={setAppliedCoupon} />

      <PointSection
        availablePoint={member.point}
        itemTotal={itemTotal}
        onPointDiscountChange={setPointDiscount}
      />

      <PaymentMethodSection />

      <OrderSummarySection
        itemTotal={itemTotal}
        shippingFee={shippingFee}
        appliedCoupon={appliedCoupon}
        pointDiscount={pointDiscount}
        membershipDiscount={membershipDiscount}
        finalPrice={finalPrice}
      />

      <TermsSection agreed={agreed} onAgreedChange={setAgreed} />

      <button className="pay" disabled={!agreed} onClick={() => setPlaced(true)}>
        {getPriceText(finalPrice)} 결제하기
      </button>

      <RecentOrdersSection orders={PAST_ORDERS} />
    </div>
  );
}
