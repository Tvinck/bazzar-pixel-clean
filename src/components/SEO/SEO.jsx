import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'Bazzar Pixel — AI генерация контента',
  description = 'Создавай изображения, видео и стикеры с помощью AI. Чат с экспертами.',
  image = '/og-image.png',
  url = 'https://bazzar-pixel-clean.vercel.app'
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    
    {/* Open Graph */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:url" content={url} />
    <meta property="og:type" content="website" />
    
    {/* Telegram */}
    <meta name="telegram:card" content="summary_large_image" />
    
    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
  </Helmet>
);

export default SEO;
