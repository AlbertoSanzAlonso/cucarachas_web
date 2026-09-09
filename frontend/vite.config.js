import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'agenda-kit': path.resolve(__dirname, '../agenda-kit/src'),
      'agenda-kit/core': path.resolve(__dirname, '../agenda-kit/src/core/index.ts'),
      'agenda-kit/react': path.resolve(__dirname, '../agenda-kit/src/react/index.ts'),
      'agenda-kit/adapters': path.resolve(__dirname, '../agenda-kit/src/adapters/index.ts'),
    },
  },
  optimizeDeps: {
    include: ['agenda-kit', '@uiw/react-md-editor'],
    esbuildOptions: {
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
      },
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
})
