import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = clsx(
    'form-control',
    {
      'is-invalid': !!error,
      'w-100': fullWidth
    },
    className
  );

  const wrapperClasses = clsx(
    'form-group',
    {
      'w-100': fullWidth
    }
  );

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      
      <div className="input-group">
        {leftIcon && (
          <div className="input-group-prepend">
            <span className="input-group-text">{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="input-group-append">
            <span className="input-group-text">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';