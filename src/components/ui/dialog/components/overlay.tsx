import { createPortal } from 'react-dom';
import { type MouseEvent as ReactMouseEvent } from 'react';
import { useDialogContext } from '../hooks/useDialogContext';

type OverlayProps = {
  /** 오버레이 클릭 시 호출. event.preventDefault()를 부르면 닫히지 않는다 */
  onOverlayClick?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  /** false면 오버레이 클릭으로 닫히지 않는다 */
  closeOnOutsideInteraction?: boolean;
};

/* AI-generated */
export function Overlay({ onOverlayClick, closeOnOutsideInteraction = true }: OverlayProps) {
  const { open, setOpen } = useDialogContext();

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const handleOverlayClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    onOverlayClick?.(event);
    if (!closeOnOutsideInteraction) return;
    if (event.defaultPrevented) return;
    setOpen(false);
  };

  return createPortal(
    <div className="dialog-overlay" onClick={handleOverlayClick} />,
    document.body,
    'DIALOG_OVERLAY',
  );
}
