import { useNavigate } from 'react-router-dom';
import { MainContent } from '@/shared/ui';
import { Banner, ProductCatalog } from '@/widgets';
import { getProductRoute } from '@/shared/config';

export const CatalogPage = () => {
  const navigate = useNavigate();

  const handleProductClick = (productId: number) => {
    navigate(getProductRoute(productId));
  };

  return (
    <MainContent>
      <div className="row">
        <div className="col">
          <Banner title="К весне готовы!" />
          
          {/* Каталог с поиском и категориями */}
          <ProductCatalog 
            showSearch={true}
            showCategories={true}
            onProductClick={handleProductClick}
          />
        </div>
      </div>
    </MainContent>
  );
};