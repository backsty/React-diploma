import { Link, useLocation } from 'react-router-dom';
import { ROUTES, getNavigationLinks, isActiveRoute } from '@/shared/config';
import { SearchWidget } from './search-widget';
import { CartWidget } from '../../cart-widget';
import headerLogo from '@/assets/images/header-logo.png';

export const Header = () => {
  const location = useLocation();
  const navigationLinks = getNavigationLinks();

  return (
    <header className="container header">
      <div className="row">
        <div className="col">
          <nav className="navbar navbar-expand-sm navbar-light bg-light">
            {/* Логотип */}
            <Link className="navbar-brand" to={ROUTES.HOME}>
              <img src={headerLogo} alt="Bosa Noga" />
            </Link>

            {/* Навигационное меню */}
            <div className="collapse navbar-collapse" id="navbarMain">
              <ul className="navbar-nav mr-auto">
                {navigationLinks.map(link => (
                  <li 
                    key={link.to}
                    className={`nav-item ${isActiveRoute(location.pathname, link.to) ? 'active' : ''}`}
                  >
                    <Link 
                      className="nav-link" 
                      to={link.to}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Элементы управления в шапке */}
              <div className="header-controls">
                <div className="header-controls-pics">
                  {/* Виджет поиска */}
                  <SearchWidget />

                  {/* Виджет корзины */}
                  <CartWidget />
                </div>
              </div>
            </div>

            {/* Мобильная навигация (кнопка-гамбургер) */}
            <button 
              className="navbar-toggler d-sm-none" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarMain"
              aria-controls="navbarMain" 
              aria-expanded="false" 
              aria-label="Переключить навигацию"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};