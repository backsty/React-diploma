import { Link } from 'react-router-dom';
import { MainContent, Button } from '@/shared/ui';
import { Banner } from '@/widgets/banner';
import { ROUTES } from '@/shared/config';

export const NotFoundPage = () => {
  return (
    <MainContent>
      <div className="row">
        <div className="col">
          <Banner title="К весне готовы!" />
          
          <section className="top-sales">
            <div className="text-center">
              <div className="mb-4" style={{ fontSize: '6rem' }}>
                😵
              </div>
              
              <h2 className="text-center mb-4">Страница не найдена</h2>
              
              <p className="lead mb-4">
                Извините, такая страница не найдена!
              </p>
              
              <p className="text-muted mb-4">
                Возможно, вы перешли по неверной ссылке или страница была удалена.
              </p>
              
              <div className="d-flex gap-2 justify-content-center">
                <Link to={ROUTES.HOME}>
                  <Button variant="primary" size="lg">
                    Вернуться на главную
                  </Button>
                </Link>
                
                <Link to={ROUTES.CATALOG}>
                  <Button variant="outline" size="lg">
                    Перейти в каталог
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainContent>
  );
};