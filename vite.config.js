import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // El service worker solo se registra manualmente desde el flujo de
      // kiosko (ver useKiosko.js) para no afectar el resto de la app (CRM/ERP).
      injectRegister: false,
      registerType: 'autoUpdate',
      manifest: {
        name: 'Kiosko SIG-SETASPLAST',
        short_name: 'Kiosko',
        display: 'standalone',
        start_url: '/kiosko/',
        scope: '/kiosko/',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        icons: [
          { src: '/SETAS.png', sizes: '500x500', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        // Precachea el bundle de la app y los modelos de reconocimiento
        // facial (pesados, ~12MB). OJO: como es una SPA de un solo bundle,
        // el JS/CSS incluye todo el código de la app (no solo kiosko) — eso
        // es inevitable sin dividir el bundle por rutas. Lo que sí evitamos
        // aquí es cachear imágenes de otros módulos (transporte, calidad,
        // etc.) que no le sirven al kiosko para nada.
        globPatterns: ['**/*.{js,css,html,webmanifest}', 'models/**', 'SETAS.png'],
        // Los shards de los modelos y el bundle principal superan el límite
        // por defecto de 2MB; se sube a 10MB para poder precachearlos.
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        // No se activa el fallback de navegación offline: el service worker
        // solo acelera cargas repetidas, no intenta servir la app sin red.
        navigateFallback: null,
      },
    }),
  ],

})
