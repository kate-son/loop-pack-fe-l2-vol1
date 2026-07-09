'use client';

import { useDialogContext } from '../hooks/useDialogContext';
import { type ReactNode } from 'react';

type TriggerProps = {
  children: ReactNode;
};

export function Trigger({ children }: TriggerProps) {
  const { setOpen } = useDialogContext();

  return <button onClick={() => setOpen(true)}>{children}</button>;
}
