import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      proxy: {
        '/n8n': {
          target: 'https://yashrajaipm.app.n8n.cloud',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/n8n/, '')
        }
      }
    }
  }
});