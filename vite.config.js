import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    base: isProd ? '/mfe/sts/' : '/',
    plugins: [
      react(),
      federation({
        name: 'mfe_sts',
        filename: 'remoteEntry.js',
        exposes: {
          './StsView': './src/StsView.jsx',
        },
        shared: {
          react:              { singleton: true, requiredVersion: '^19.0.0' },
          'react-dom':        { singleton: true, requiredVersion: '^19.0.0' },
          'react-router-dom': { singleton: true },
          '@gestep/shared':   { singleton: true },
        },
      }),
    ],
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: 'http://100.111.39.48:5156',
          changeOrigin: true,
        }
      }
    },
    build: {
      outDir: 'dist',
      target: 'esnext', // requerido por @originjs/vite-plugin-federation
    },
  }
})
