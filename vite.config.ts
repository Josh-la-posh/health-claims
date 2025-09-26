import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

const plugins: PluginOption[] = [react(), tailwindcss()];
if (process.env.ANALYZE) plugins.push(visualizer({ filename: 'dist/bundle-analysis.html', open: false }) as unknown as PluginOption);

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    // Removed custom manualChunks temporarily to diagnose 'Cannot access ce before initialization' error.
    // If this resolves the issue, the previous chunk splitting introduced an execution order/circular dep problem.
    sourcemap: true,
  }
})

