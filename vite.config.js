import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/auth': {
        target: 'https://dummyjson.com',
        changeOrigin: true
      }
    }
  }
});
