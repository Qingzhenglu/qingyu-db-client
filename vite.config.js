import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  define: {
    'process.env': { NODE_ENV: "development" }
  },
  plugins: [
    react()
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,  // 必须开启
        modifyVars: {
          '@primary-color': '#1890ff' // 可选主题配置
        }
      }
    }
  },
  root: path.join(__dirname, 'src/renderer'),
  base: './',
  build: {
    outDir: path.join(__dirname, 'dist/renderer'),
    emptyOutDir: true
  },
  server: {
    port: 3000,
    strictPort: true
  }
})