'use client';

import { useState } from 'react';
import { useSelect } from '@/components/ui/select/hooks/useSelect';
import { Select } from '@/components/ui/select';
import type { SelectOption } from '@/components/ui/select/types';

type DeliveryOption = {
  id: string;
  label: string;
  price: number;
  disabled?: boolean;
};

const deliveryOptions: DeliveryOption[] = [
  { id: 'standard', label: '일반 배송 (무료)', price: 0 },
  { id: 'express', label: '빠른 배송 (+3,000원)', price: 3000 },
  { id: 'dawn', label: '새벽 배송 (마감)', price: 5000, disabled: true },
];

type RawSizeOption = {
  id: string;
  label: string;
  stock: number;
};

const rawSizeOptions: RawSizeOption[] = [
  { id: 's', label: 'S', stock: 5 },
  { id: 'm', label: 'M', stock: 0 },
  { id: 'l', label: 'L', stock: 2 },
  { id: 'xl', label: 'XL', stock: 0 },
];

const sizeOptions = rawSizeOptions.map((size) => ({ ...size, disabled: size.stock === 0 }));

type RawColorOption = {
  id: string;
  label: string;
  hex: string;
  inStock: boolean;
};

const rawColorOptions: RawColorOption[] = [
  { id: 'black', label: '블랙', hex: '#171717', inStock: true },
  { id: 'white', label: '화이트', hex: '#f5f5f5', inStock: true },
  { id: 'red', label: '레드', hex: '#e11d48', inStock: false },
  { id: 'blue', label: '블루', hex: '#2563eb', inStock: true },
];

const colorOptions = rawColorOptions.map((color) => ({ ...color, disabled: !color.inStock }));

const compoundOptions: SelectOption[] = [
  { id: 'card', label: '카드 결제' },
  { id: 'transfer', label: '계좌 이체' },
  { id: 'point', label: '포인트 결제', disabled: true },
  { id: 'point1', label: '포인트 결제', disabled: true },
  { id: 'point2', label: '포인트 결제', disabled: true },
  { id: 'point3', label: '포인트 결제', disabled: true },
  { id: 'point4', label: '포인트 결제', disabled: true },
  { id: 'point5', label: '포인트 결제', disabled: true },
  { id: 'point6', label: '포인트 결제', disabled: true },
];

/* AI-generated */
function DeliverySelect() {
  const [selected, setSelected] = useState<DeliveryOption | null>(deliveryOptions[0]);
  const { open, items, getTriggerProps, getListboxProps, getOptionProps } =
    useSelect<DeliveryOption>({
      options: deliveryOptions,
      value: selected,
      onChange: setSelected,
    });

  return (
    <div className="select-root">
      <button type="button" className="select-trigger" {...getTriggerProps()}>
        {selected ? selected.label : '배송 방법 선택'}
      </button>
      {open && (
        <ul className="select-content" {...getListboxProps()}>
          {items.map((item) => (
            <li
              key={item.option.id}
              className={[
                'select-option',
                item.selected && 'select-option--selected',
                item.highlighted && 'select-option--highlighted',
                item.disabled && 'select-option--disabled',
              ]
                .filter(Boolean)
                .join(' ')}
              {...getOptionProps(item.index)}
            >
              {item.option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* AI-generated */
function SizeSelect() {
  const [selected, setSelected] = useState<(typeof sizeOptions)[number] | null>(null);
  const { open, items, getTriggerProps, getListboxProps, getOptionProps } = useSelect({
    options: sizeOptions,
    value: selected,
    onChange: setSelected,
  });

  return (
    <div className="select-root">
      <button type="button" className="select-trigger" {...getTriggerProps()}>
        {selected ? selected.label : '사이즈 선택'}
      </button>
      {open && (
        <ul className="select-content select-content--grid" {...getListboxProps()}>
          {items.map((item) => (
            <li
              key={item.option.id}
              className={[
                'select-option',
                'select-option--size',
                item.selected && 'select-option--selected',
                item.highlighted && 'select-option--highlighted',
                item.disabled && 'select-option--disabled',
              ]
                .filter(Boolean)
                .join(' ')}
              {...getOptionProps(item.index)}
            >
              {item.option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* AI-generated */
function ColorSelect() {
  const [selected, setSelected] = useState<(typeof colorOptions)[number] | null>(null);
  const { open, items, getTriggerProps, getListboxProps, getOptionProps } = useSelect({
    options: colorOptions,
    value: selected,
    onChange: setSelected,
  });

  return (
    <div className="select-root">
      <button type="button" className="select-trigger" {...getTriggerProps()}>
        {selected ? (
          <>
            <span className="select-swatch" style={{ backgroundColor: selected.hex }} />
            {selected.label}
          </>
        ) : (
          '색상 선택'
        )}
      </button>
      {open && (
        <ul className="select-content select-content--thumbnail" {...getListboxProps()}>
          {items.map((item) => (
            <li
              key={item.option.id}
              className={[
                'select-option',
                'select-option--thumbnail',
                item.selected && 'select-option--selected',
                item.highlighted && 'select-option--highlighted',
                item.disabled && 'select-option--disabled',
              ]
                .filter(Boolean)
                .join(' ')}
              {...getOptionProps(item.index)}
            >
              <span className="select-swatch" style={{ backgroundColor: item.option.hex }} />
              {item.option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SelectPage() {
  const [compoundSelected, setCompoundSelected] = useState<SelectOption | null>(null);

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Select (Headless)</h1>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>텍스트 옵션</h2>
        <DeliverySelect />
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>사이즈 옵션</h2>
        <SizeSelect />
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>썸네일 옵션</h2>
        <ColorSelect />
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Compound (기본 UI)</h2>
        <Select options={compoundOptions} value={compoundSelected} onChange={setCompoundSelected}>
          <Select.Trigger>
            <Select.Value placeholder="결제 수단 선택" />
          </Select.Trigger>
          <Select.Content />
        </Select>
      </section>
    </main>
  );
}
