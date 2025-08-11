import { useAtom } from '@reatom/npm-react';
import { Button, Loader } from '@/shared/ui';
import {
  catalogLoadingMoreAtom,
  catalogHasMoreAtom,
  canLoadMore
} from '../model/catalog';
import { ctx } from '@/shared/store';

export interface LoadMoreButtonProps {
  onLoadMore?: (() => void) | undefined;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
}

export const LoadMoreButton = ({
  className = '',
  onLoadMore,
  disabled = false
}: LoadMoreButtonProps) => {
  const [isLoadingMore] = useAtom(catalogLoadingMoreAtom);
  const [hasMore] = useAtom(catalogHasMoreAtom);
  
  const canLoad = canLoadMore(ctx);
  const isDisabled = disabled || !canLoad || isLoadingMore;

  const handleClick = () => {
    if (isDisabled) return;
    
    if (onLoadMore) {
      onLoadMore();
    }
  };

  // Если больше нет товаров для загрузки, не отображаем кнопку
  if (!hasMore) {
    return null;
  }

  return (
    <div className={`load-more-button text-center ${className}`}>
      {/* Лоадер над кнопкой во время загрузки */}
      {isLoadingMore && (
        <div className="mb-3">
          <Loader size="sm" />
        </div>
      )}
      
      <Button
        variant="outline"
        size="lg"
        onClick={handleClick}
        disabled={isDisabled}
        className="px-5"
        aria-label="Загрузить больше товаров"
      >
        {isLoadingMore ? 'Загружаем...' : 'Загрузить ещё'}
      </Button>
    </div>
  );
};