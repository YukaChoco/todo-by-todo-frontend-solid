import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
    proxy: {
      "/todos": {
        target: "https://todo.mazrean.com",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "esnext",
  },
});
