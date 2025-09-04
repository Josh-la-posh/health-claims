import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

const plugins: any[] = [react(), tailwindcss()];
if (process.env.ANALYZE) plugins.push(visualizer({ filename: 'dist/bundle-analysis.html', open: false }));

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('react-dom') || id.includes('react')) return 'react-vendor';
            if (id.includes('@tanstack')) return 'query-vendor';
            if (id.includes('clsx') || id.includes('clsx')) return 'utils-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})

