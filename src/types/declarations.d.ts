declare module '*.js' {
  const content: any;
  export default content;
}

declare module '../lib/galleryAPI' {
  export const galleryAPI: any;
  export default galleryAPI;
}

declare module '../utils/secureAPI' {
  export const secureAPI: any;
  export default secureAPI;
}

declare module '../lib/supabase' {
  export const supabase: any;
  export default supabase;
}
