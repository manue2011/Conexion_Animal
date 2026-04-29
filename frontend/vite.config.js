import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://conexion-animal-bice.vercel.app',
      dynamicRoutes: [
        '/',
        '/tablon',
        '/privacidad',
        '/terminos',
        '/contacto',
        '/sobre-nosotros',
        '/adoptados',
        '/planes',
        '/colonias'
      ]
    })
  ],
})
