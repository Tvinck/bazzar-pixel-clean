import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['icon-192.png', 'icon-512.png'],
    //   manifest: {
    //     name: 'Pixel AI - AI Image & Video Generator',
    //     short_name: 'Pixel AI',
    //     description: 'Create stunning AI-generated images, videos, and music',
    //     theme_color: '#6366F1',
    //     background_color: '#0B0F19',
    //     display: 'standalone',
    //     icons: [
    //       {
    //         src: 'icon-192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'icon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       }
    //     ]
    //   }
    // })
  ],
  build: {
    // Optimization
    target: 'es2015',
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true
    //   }
    // },
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion': ['framer-motion'],
          'icons': ['lucide-react'],
          'query': ['@tanstack/react-query']
        }
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  server: {
    host: '0.0.0.0', // Listen on all interfaces
    port: 5176,
    strictPort: false,
    cors: true,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react']
  }
});
