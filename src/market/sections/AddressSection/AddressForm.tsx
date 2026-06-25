import { useState } from 'react';
import type { Address } from '../../types/address.types';
import { Radio } from '../../../common/components/Radio.tsx';
import { Checkbox } from '../../../common/components/Checkbox.tsx';

type AddressFormProps = {
  addresses: Address[];
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
};

export function AddressForm({ addresses, selectedAddressId, onSelectAddress }: AddressFormProps) {
  const [onlyNear, setOnlyNear] = useState(false);
  const list = onlyNear ? addresses.filter((a) => !a.isRemote) : addresses;

  // 필터로 현재 선택된 주소가 가려지면, 보이는 목록 중 첫 번째로 선택을 옮긴다. /* AI-generated */
  const handleOnlyNearChange = (checked: boolean) => {
    setOnlyNear(checked);
    if (!checked) return;

    const selected = addresses.find((a) => a.id === selectedAddressId);
    const nearAddresses = addresses.filter((a) => !a.isRemote);
    if (selected?.isRemote && nearAddresses.length > 0) {
      onSelectAddress(nearAddresses[0].id);
    }
  };

  return (
    <>
      <Checkbox
        labelClassName="filter"
        checked={onlyNear}
        onChange={(e) => handleOnlyNearChange(e.target.checked)}
        caption="도서산간 제외"
      />
      {list.map((address) => (
        <Radio
          key={address.id}
          labelClassName="addr"
          checked={address.id === selectedAddressId}
          onChange={() => onSelectAddress(address.id)}
        >
          <span>
            {address.label} · {address.recipient} ({address.detail})
            {address.isRemote ? ' · 도서산간' : ''}
          </span>
        </Radio>
      ))}
    </>
  );
}
