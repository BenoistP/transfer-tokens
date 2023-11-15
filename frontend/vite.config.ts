import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // base: '', // for github pages
  build: {
    rollupOptions: {
        output:{
            manualChunks(/* id */) {
                // if (id.includes('node_modules')) {
                //     return id.toString().split('node_modules/')[1].split('/')[0].toString();
                // }
                // if (id.indexOf("react") !== -1) { return; }

                // if (id.includes('node_modules')) {
                //   if(id.includes("i18next")){
                //     return "i18next-vendor";
                //   }else if(id.includes("react-dom")){
                //     return "react-dom-vendor";
                //   }else if(id.includes("react-router-dom")){
                //     return "react-router-dom-vendor";
                //   }else if(id.includes("wagmi")){
                //     return "wagmi-vendor";
                //   }else if(id.includes("dicebear")){
                //     return "dicebear-vendor";
                //   }else if(id.includes("rainbow-me")){
                //     return "rainbow-me-vendor";
                //   }else if(id.includes("viem")){
                //     return "viem-vendor";
                //   }

                //   // return 'vendor';
                //   console.debug("id", id);
                //   return id.toString().split('node_modules/')[1].split('/')[0].toString();
                // }
            }
        }
    }
},

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
