import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) => {
  const baseClasses = 'btn';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline-primary',
    link: 'btn-link'
  };
  
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      'btn-block': fullWidth,
      'disabled': loading || disabled
    },
    className
  );

  return (
    <button
      className={classes}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <span 
          className="spinner-border spinner-border-sm me-2" 
          role="status" 
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};