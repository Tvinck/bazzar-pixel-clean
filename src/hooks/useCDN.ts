/// <reference types="vite/client" />

const SUPABASE_CDN = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/`
  : '';

export const getCDNUrl = (path: string | undefined | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  if (!SUPABASE_CDN) return `/${cleanPath}`;

  // Use webp if it's png or jpg
  let finalPath = cleanPath;
  if (finalPath.endsWith('.png') || finalPath.endsWith('.jpg') || finalPath.endsWith('.jpeg')) {
     finalPath = finalPath.replace(/\.(png|jpe?g)$/i, '.webp');
  }

  return `${SUPABASE_CDN}${finalPath}`;
};

export const useCDN = () => {
  return { getCDNUrl };
};

