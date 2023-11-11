import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // base: '', // for github pages
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  preview: {
    port: 8000, // serve BUILD
    strictPort: true,
    open: false,
    host: true
  },
  server: {
    port: 3000, // dev
    strictPort: false,
    open: false,
  },
  envPrefix: ['PUBLIC_', 'APIKEY_'],
})
