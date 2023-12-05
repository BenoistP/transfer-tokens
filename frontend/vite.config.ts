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
						if (id.includes('i18n')) {
							return 'i18next-vendor'
						} else if (id.includes('rainbow-me')) {
							if (id.includes('walletConnectors')) return 'rainbow-me-connectors-vendor'
							if (id.includes('chunk')) return 'rainbow-me-misc-vendor'
							return 'rainbow-me-vendor'
						} else if (id.includes('wagmi')) {
							return 'wagmi-vendor'
						} else if (id.includes('dicebear') || id.includes('heroicons') || id.includes('country-flag-icons')) {
							return 'icons-vendor'
						} else if (id.includes('viem')) {
							return 'viem-vendor'
						} else if (id.includes('react-router-dom')) {
							return 'react-router-dom-vendor'
						} else if (id.includes('react-dom')) {
							return 'react-dom-vendor'
						} else if (id.includes('lodash')) {
							return 'lodash-vendor'
						} else if (id.includes('walletconnect') || id.includes('@safe')) {
							return 'wallets-vendor1'
						} else if (id.includes('metamask') || id.includes('@coinbase')) {
							return 'wallets-vendor2'
						} else if (
							id.includes('sha') ||
							id.includes('eth-') ||
							id.includes('keccak') ||
							id.includes('abitype') ||
							id.includes('json-rpc') ||
							id.includes('bignumber') ||
							id.includes('multiformats') ||
              id.includes('@noble')
						) {
							return 'misc-crypto-vendor'
						} else if (id.includes('qrcode')) {
							return 'qrcode-vendor'
						} else if (id.includes('react')) {
							return 'react-vendor'
						} else if (id.includes('rxjs')) {
							return 'rxjs-vendor'
						} else if (id.includes('motionone') || id.includes('semver') || id.includes('base64') || id.includes('uuid')) {
							return 'misc-vendor1'
						}
            // console.debug("id", id);
            return 'global-vendor'
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