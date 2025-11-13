import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext'
  },
  define: {
    'process.env': {}
  },
  base: '/',
  optimizeDeps: {
    include: ['react', 'react-dom', 'ethers']
  }
})
