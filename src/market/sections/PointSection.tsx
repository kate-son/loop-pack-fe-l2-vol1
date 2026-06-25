import { useState } from 'react';
import { Section } from '../../common/components/Section.tsx';
import { Checkbox } from '../../common/components/Checkbox.tsx';
import { getPriceText } from '../../utils.ts';

type Props = {
  availablePoint: number;
  itemTotal: number;
  onPointDiscountChange: (discount: number) => void;
};

export function PointSection({ availablePoint, itemTotal, onPointDiscountChange }: Props) {
  const [usePoint, setUsePoint] = useState(false);
  const [pointInput, setPointInput] = useState(0);

  const reportDiscount = (nextUsePoint: boolean, nextPointInput: number) => {
    onPointDiscountChange(nextUsePoint ? Math.min(nextPointInput, availablePoint, itemTotal) : 0);
  };

  const handleUsePointChange = (checked: boolean) => {
    setUsePoint(checked);
    reportDiscount(checked, pointInput);
  };

  const handlePointInputChange = (value: number) => {
    setPointInput(value);
    reportDiscount(usePoint, value);
  };

  return (
    <Section title="적립금">
      <Checkbox
        checked={usePoint}
        onChange={(e) => handleUsePointChange(e.target.checked)}
        caption={`적립금 사용 (보유 ${getPriceText(availablePoint, 'P')})`}
      />
      {usePoint ? (
        <input
          type="number"
          value={pointInput}
          onChange={(e) => handlePointInputChange(Number(e.target.value))}
        />
      ) : null}
    </Section>
  );
}
