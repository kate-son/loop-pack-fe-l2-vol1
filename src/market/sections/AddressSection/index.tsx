import { useState } from 'react';
import { Section } from '../../../common/components/Section.tsx';
import { ADDRESSES } from '../../data.ts';
import { AddressForm } from './AddressForm.tsx';

type AddressSectionProps = {
  onRemoteChange: (isRemote: boolean) => void;
};

export function AddressSection({ onRemoteChange }: AddressSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(ADDRESSES[0].id);
  const selectedAddress = ADDRESSES.find((a) => a.id === selectedAddressId)!;

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    const next = ADDRESSES.find((a) => a.id === id)!;
    onRemoteChange(next.isRemote);
  };

  return (
    <Section
      title="배송지"
      rightSlot={
        <button className="link" onClick={() => setExpanded((v) => !v)}>
          {expanded ? '접기' : '변경'}
        </button>
      }
    >
      {expanded ? (
        <AddressForm
          addresses={ADDRESSES}
          selectedAddressId={selectedAddressId}
          onSelectAddress={handleSelectAddress}
        />
      ) : (
        <p className="addr-summary">
          {selectedAddress.label} · {selectedAddress.recipient} ({selectedAddress.detail})
        </p>
      )}
    </Section>
  );
}
