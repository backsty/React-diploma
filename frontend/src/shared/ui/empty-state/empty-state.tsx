import { ReactNode } from 'react';
import { Button } from '../button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) => {
  return (
    <div className={`text-center py-5 ${className || ''}`}>
      {icon && (
        <div className="mb-3 text-muted" style={{ fontSize: '3rem' }}>
          {icon}
        </div>
      )}
      
      <h4 className="text-muted mb-2">{title}</h4>
      
      {description && (
        <p className="text-muted mb-4">{description}</p>
      )}
      
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};