import { useState, useEffect, useRef } from 'react';
import type { Address } from '@/market/types';
import { Radio } from '@/common/components/Radio.tsx';
import { Checkbox } from '@/common/components/Checkbox.tsx';
import { ADDRESSES } from '@/market/data.ts';

type AddressFormProps = {
  /** 현재 선택된 주소. null이면 마운트 시 첫 번째 주소로 초기화 */
  selectedAddress: Address | null;
  /** 주소 선택 시 호출 */
  onSelectAddress: (address: Address) => void;
};

export const AddressForm = function AddressForm({
  selectedAddress,
  onSelectAddress,
}: AddressFormProps) {
  const [onlyNear, setOnlyNear] = useState<boolean>(false);
  const list = onlyNear ? ADDRESSES.filter((a) => !a.isRemote) : ADDRESSES;

  // useEffect deps에 추가하면 마운트 외에도 실행되므로 ref로 초기값 캡처
  const initialSelectedAddressRef = useRef(selectedAddress);
  const onSelectAddressRef = useRef(onSelectAddress);
  useEffect(() => {
    if (!initialSelectedAddressRef.current) onSelectAddressRef.current(ADDRESSES[0]);
  }, []);

  // 필터로 현재 선택된 주소가 가려지면, 보이는 목록 중 첫 번째로 선택을 옮긴다. /* AI-generated */
  const handleOnlyNearChange = (checked: boolean) => {
    setOnlyNear(checked);
    if (!checked) return;

    const nearAddresses = ADDRESSES.filter((a) => !a.isRemote);
    if (selectedAddress && selectedAddress?.isRemote && nearAddresses?.length > 0) {
      onSelectAddress(nearAddresses[0]);
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
          checked={address.id === selectedAddress?.id}
          onChange={() => onSelectAddress(address)}
        >
          <span>
            {address.label} · {address.recipient} ({address.detail})
            {address.isRemote ? ' · 도서산간' : ''}
          </span>
        </Radio>
      ))}
    </>
  );
};
