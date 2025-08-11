import bannerImage from '@/assets/images/banner.jpg';

export interface BannerProps {
  title?: string;
  className?: string;
}

export const Banner = ({ 
  title = 'К весне готовы!', 
  className = '' 
}: BannerProps) => {
  return (
    <div className={`banner ${className}`}>
      <img 
        src={bannerImage} 
        className="img-fluid" 
        alt={title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <h2 className="banner-header">{title}</h2>
    </div>
  );
};