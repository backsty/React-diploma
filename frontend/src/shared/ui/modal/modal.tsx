import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  backdrop?: boolean;
  keyboard?: boolean;
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  centered = false,
  backdrop = true,
  keyboard = true,
  className
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (keyboard && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, keyboard, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (backdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="modal d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
    >
      <div className={clsx(
        'modal-dialog',
        {
          [`modal-${size}`]: size !== 'md',
          'modal-dialog-centered': centered
        }
      )}>
        <div className={clsx('modal-content', className)}>
          {title && (
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>
          )}
          
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};