/// <reference types="vite/client" />

const SUPABASE_CDN = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/`
  : '';

export const getCDNUrl = (path: string | undefined | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  if (!SUPABASE_CDN) return `/${cleanPath}`;

  // No automatic extension replacement to avoid 400 errors for missing webp assets
  let finalPath = cleanPath;

  return `${SUPABASE_CDN}${finalPath}`;
};

export const useCDN = () => {
  return { getCDNUrl };
};

