import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    strictPort: true, // Fuerza el uso del puerto 3000
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // 🚀 OPTIMIZACIONES DE BUILD PARA PRODUCCIÓN
  build: {
    // Code splitting automático
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor libraries
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
          charts: ['recharts'],
        }
      }
    },
    // Optimizaciones de tamaño
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // 🚀 OPTIMIZACIONES DE DESARROLLO
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'react-router-dom',
      'axios',
      'recharts'
    ],
  },
  // Cache para desarrollo
  cacheDir: 'node_modules/.vite',
})