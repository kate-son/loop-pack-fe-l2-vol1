import { createContext } from 'react';

interface DialogContextValue {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
