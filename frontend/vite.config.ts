import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../public',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        manualChunks: {
          'vendor': [
            'vue',
            'vue-router',
            'pinia'
          ],
          'solana': [
            '@solana/wallet-adapter-base',
            '@solana/wallet-adapter-phantom',
            '@solana/wallet-adapter-solflare',
            '@solana/wallet-adapter-wallets',
            '@solana/web3.js'
          ],
          'ui': [
            'vue-toastification'
          ]
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@fractalwagmi/popup-connection']
  },
  resolve: {
    alias: {
      'react': 'vue',
      'react-dom': 'vue'
    }
  }
})
