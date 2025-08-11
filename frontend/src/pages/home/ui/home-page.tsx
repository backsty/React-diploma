import { useNavigate } from 'react-router-dom';
import { MainContent } from '@/shared/ui';
import { Banner, TopSales, ProductCatalog } from '@/widgets';
import { getProductRoute } from '@/shared/config';

export const HomePage = () => {
  const navigate = useNavigate();

  const handleProductClick = (productId: number) => {
    navigate(getProductRoute(productId));
  };

  return (
    <MainContent>
      <div className="row">
        <div className="col">
          <Banner title="К весне готовы!" />
          
          <TopSales onProductClick={handleProductClick} />
          
          <section className="catalog">
            <h2 className="text-center">Каталог</h2>
            
            <ProductCatalog 
              showSearch={true}
              showCategories={true}
              onProductClick={handleProductClick}
            />
          </section>
        </div>
      </div>
    </MainContent>
  );
};