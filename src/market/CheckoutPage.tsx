import { useState } from 'react';
import { CART, MEMBER, PAST_ORDERS } from '@/market/data';
import { DeliveryMemoSection } from '@/market/sections/DeliveryMemoSection';
import { CartSection } from '@/market/sections/CartSection';
import { CouponSection } from '@/market/sections/CouponSection';
import { PointSection } from '@/market/sections/PointSection';
import { PaymentMethodSection } from '@/market/sections/PaymentMethodSection';
import { SummarySection } from '@/market/sections/SummarySection';
import { TermsSection } from '@/market/sections/TermsSection';
import { RecentOrdersSection } from '@/market/sections/RecentOrdersSection';
import '@/market/market.css';
import { AddressSection } from '@/market/sections/AddressSection';
import { getPriceText } from '@/utils.ts';
import { CheckoutCompletePage } from '@/market/CheckoutCompletePage.tsx';
import { useCheckout } from '@/market/hooks/useCheckoutSummary';

export function CheckoutPage() {
  const member = MEMBER;
  const cart = CART;

  const [agreed, setAgreed] = useState<boolean>(false);
  const [placed, setPlaced] = useState<boolean>(false);

  const {
    itemTotal,
    shippingFee,
    gradeDiscount,
    gradeDiscountItemTotal,
    couponDiscount,
    pointDiscount,
    finalPrice,
    setCouponDiscount,
    setPointDiscount,
    setIsRemoteAddress,
  } = useCheckout(cart, member);

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

      <CouponSection onDiscountChange={setCouponDiscount} />

      <PointSection
        availablePoint={member.point}
        itemTotal={gradeDiscountItemTotal}
        onPointDiscountChange={setPointDiscount}
      />

      <PaymentMethodSection />

      <SummarySection
        itemTotal={itemTotal}
        shippingFee={shippingFee}
        couponDiscount={couponDiscount}
        pointDiscount={pointDiscount}
        gradeDiscount={gradeDiscount}
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
