import clsx from 'clsx';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export const Loader = ({ 
  size = 'md', 
  className, 
  text,
  fullScreen = false 
}: LoaderProps) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  const spinner = (
    <div 
      className={clsx('spinner-border', sizeClasses[size], className)} 
      role="status"
    >
      <span className="sr-only">Загрузка...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          {spinner}
          {text && <div className="mt-2">{text}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center p-3">
      <div className="text-center">
        {spinner}
        {text && <div className="mt-2">{text}</div>}
      </div>
    </div>
  );
};