import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config';

export const Footer = () => {
  return (
    <footer className="footer">
      {/* Контейнер с отступами внутри футера */}
      <div className="footer-content">
        <div className="row">
          {/* Информация */}
          <div className="col">
            <section>
              <h5>Информация</h5>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link to={ROUTES.ABOUT} className="nav-link">
                    О магазине
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to={ROUTES.CATALOG} className="nav-link">
                    Каталог
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to={ROUTES.CONTACTS} className="nav-link">
                    Контакты
                  </Link>
                </li>
              </ul>
            </section>
          </div>

          {/* Оплата и копирайт */}
          <div className="col">
            <section>
              <h5>Принимаем к оплате:</h5>
              <div className="footer-pay">
                <div className="footer-pay-systems footer-pay-systems-paypal" title="PayPal" />
                <div className="footer-pay-systems footer-pay-systems-master-card" title="MasterCard" />
                <div className="footer-pay-systems footer-pay-systems-visa" title="VISA" />
                <div className="footer-pay-systems footer-pay-systems-yandex" title="Яндекс.Деньги" />
                <div className="footer-pay-systems footer-pay-systems-webmoney" title="WebMoney" />
                <div className="footer-pay-systems footer-pay-systems-qiwi" title="QIWI" />
              </div>
            </section>
            
            <section>
              <div className="footer-copyright">
                2009-2019 © BosaNoga.ru — модный интернет-магазин обуви и аксессуаров.
                Все права защищены.<br />
                Доставка по всей России!
              </div>
            </section>
          </div>

          {/* Контакты */}
          <div className="col text-right">
            <section className="footer-contacts">
              <h5>Контакты:</h5>
              <a 
                className="footer-contacts-phone" 
                href="tel:+7-495-790-35-03"
              >
                +7 495 790 35 03
              </a>
              <span className="footer-contacts-working-hours">
                Ежедневно: с 09-00 до 21-00
              </span>
              <a 
                className="footer-contacts-email" 
                href="mailto:office@bosanoga.ru"
              >
                office@bosanoga.ru
              </a>
              
              <div className="footer-social-links">
                <div 
                  className="footer-social-link footer-social-link-twitter"
                  title="Twitter"
                  role="button"
                  tabIndex={0}
                  onClick={() => window.open('https://twitter.com', '_blank')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      window.open('https://twitter.com', '_blank');
                    }
                  }}
                />
                <div 
                  className="footer-social-link footer-social-link-vk"
                  title="ВКонтакте"
                  role="button"
                  tabIndex={0}
                  onClick={() => window.open('https://vk.com', '_blank')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      window.open('https://vk.com', '_blank');
                    }
                  }}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </footer>
  );
};