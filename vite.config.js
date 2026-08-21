import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.js']
  },
  server: {
    proxy: {
      '/auth': 'http://127.0.0.1:3000',
      '/bandas': 'http://127.0.0.1:3000',
      '/eventos': 'http://127.0.0.1:3000',
      '/lineup': 'http://127.0.0.1:3000',
      '/dashboard': 'http://127.0.0.1:3000',
      '/publico': 'http://127.0.0.1:3000'
    }
  }
});
