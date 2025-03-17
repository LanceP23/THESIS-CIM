import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Add this line to resolve paths easily
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const { name } = assetInfo;
          if (name && /\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) {
            return 'assets/[name]-[hash][extname]'; // Customize asset output path and naming
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
