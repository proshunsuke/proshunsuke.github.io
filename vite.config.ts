import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: { alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) } },
});
