import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';
import type { DialogContextValue } from '../context/context';

type UseDialogParams = {
  open?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  defaultOpen?: boolean;
  /** Esc 입력 시 호출. event.preventDefault()를 부르면 닫히지 않는다 */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** 오버레이 클릭 시 호출. event.preventDefault()를 부르면 닫히지 않는다 */
  onOverlayClick?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  /** false면 Esc/오버레이 클릭 모두로 닫히지 않는다 */
  closeOnOutsideInteraction: boolean;
};

/* AI-generated : dialog/index.tsx에 정의된 내용 hook으로 분리 요청 */
export function useDialog({
  open,
  onOpenChange,
  defaultOpen,
  onEscapeKeyDown,
  onOverlayClick,
  closeOnOutsideInteraction,
}: UseDialogParams): DialogContextValue {
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const [dialogOpen, setDialogOpen] = useState<boolean>(defaultOpen || false);
  const mergedOpen = isControlled ? open : dialogOpen;

  const contextValue = useMemo(() => {
    const setOpen = (isOpen: boolean) => {
      if (!isControlled) {
        setDialogOpen(isOpen);
      }
      onOpenChange?.(isOpen);
    };
    return {
      open: mergedOpen,
      setOpen,
      onOverlayClick,
      closeOnOutsideInteraction,
    };
  }, [mergedOpen, isControlled, onOpenChange, onOverlayClick, closeOnOutsideInteraction]);

  useEffect(() => {
    if (!mergedOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      onEscapeKeyDown?.(e);
      if (!closeOnOutsideInteraction) return;
      if (e.defaultPrevented) return;
      contextValue.setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mergedOpen, onEscapeKeyDown, closeOnOutsideInteraction, contextValue]);

  useEffect(() => {
    if (!mergedOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mergedOpen]);

  return contextValue;
}
