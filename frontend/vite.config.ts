import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
// import dotenv from 'dotenv';

// dotenv.config(); // load env vars from .env

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  server: {
    port: 8000,
    open: false,
  },
  envPrefix: ['PUBLIC_', 'APIKEY_'],
  // define: {
  //   ALCHEMY_APIKEY: `"${process.env.ALCHEMY_APIKEY}"`,
  //   INFURA_APIKEY: `"${process.env.INFURA_APIKEY}"`,
  //   WALLET_CONNECT_APIKEY: `"${process.env.WALLET_CONNECT_APIKEY}"`,
  // },

})
