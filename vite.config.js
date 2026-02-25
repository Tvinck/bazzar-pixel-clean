import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react()
  ],
  define: {
    'process.env': {}
  },
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
