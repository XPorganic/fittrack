import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig({
  base: '/fittrack/',
  build: {
    sourcemap: 'hidden',
    outDir: 'dist',
  },
  server: {
    port: 3000,
    strictPort: false, // 允许端口冲突时自动使用其他端口
    host: true,
    hmr: {
      overlay: false, // 减少不必要的连接
    },
  },
  preview: {
    port: 3000,
    strictPort: false, // 允许端口冲突时自动使用其他端口
    host: true,
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths()
  ],
})
