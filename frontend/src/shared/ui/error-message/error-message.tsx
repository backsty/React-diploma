import clsx from 'clsx';
import { ReactNode } from 'react';

export interface ErrorMessageProps {
  message?: string | undefined;
  children?: ReactNode | undefined;
  className?: string;
  variant?: 'alert' | 'text' | 'inline';
  onRetry?: (() => void) | undefined;
  retryText?: string;
}

export const ErrorMessage = ({
  message,
  children,
  className,
  variant = 'alert',
  onRetry,
  retryText = 'Попробовать снова'
}: ErrorMessageProps) => {
  const content = children || message;
  
  if (!content) {
    return null;
  }

  if (variant === 'text') {
    return (
      <div className={clsx('text-danger', className)}>
        {content}
        {onRetry && (
          <button
            type="button"
            className="btn btn-link btn-sm p-0 ms-2"
            onClick={onRetry}
          >
            {retryText}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <small className={clsx('text-danger', className)}>
        {content}
      </small>
    );
  }

  return (
    <div className={clsx('alert alert-danger', className)} role="alert">
      <div className="d-flex justify-content-between align-items-center">
        <div className="flex-grow-1">{content}</div>
        {onRetry && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm ms-2"
            onClick={onRetry}
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};