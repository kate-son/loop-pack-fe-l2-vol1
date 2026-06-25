import { Section } from '../../common/components/Section.tsx';
import { Checkbox } from '../../common/components/Checkbox.tsx';
import { getPriceText } from '../../utils.ts';

type Props = {
  usePoint: boolean;
  onUsePointChange: (usePoint: boolean) => void;
  pointInput: number;
  onPointInputChange: (point: number) => void;
  availablePoint: number;
};

export function PointSection({
  usePoint,
  onUsePointChange,
  pointInput,
  onPointInputChange,
  availablePoint,
}: Props) {
  return (
    <Section title={'적립금'}>
      <Checkbox
        checked={usePoint}
        onChange={(e) => onUsePointChange(e.target.checked)}
        caption={`적립금 사용 (보유 ${getPriceText(availablePoint, 'P')})`}
      />
      {usePoint ? (
        <input
          type="number"
          value={pointInput}
          onChange={(e) => onPointInputChange(Number(e.target.value))}
        />
      ) : null}
    </Section>
  );
}
