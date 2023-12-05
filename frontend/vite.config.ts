import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	// base: '', // for github pages
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						if (id.includes('dicebear') || id.includes('heroicons') || id.includes('country-flag-icons')) {
							return 'icons-vendor'
						}
						if (
							id.includes('sha') ||
							id.includes('eth-') ||
							id.includes('keccak') ||
							id.includes('abitype') ||
							id.includes('json-rpc') ||
							id.includes('bignumber') ||
							id.includes('multiformats') ||
              id.includes('@noble')
						) return 'misc-crypto-vendor'
						if (id.includes('i18n')) {
							return 'i18next-vendor'
						}
						if (id.includes('rainbow-me')) {
							if (id.includes('walletConnectors')) return 'rainbow-me-connectors-vendor'
							if (id.includes('chunk')) return 'rainbow-me-chunks-vendor'
							return 'rainbow-me-vendor'
						}
						if (id.includes('lodash')) {
							return 'lodash-vendor'
						}
					}
				},

			},
		},
	},
	plugins: [react(), tsconfigPaths()],
	preview: {
		port: 8000, // serve BUILD
		strictPort: true,
		open: false,
		host: true,
	},
	server: {
		port: 3000, // dev
		strictPort: false,
		open: false,
	},
	envPrefix: ['PUBLIC_', 'APIKEY_'],
})