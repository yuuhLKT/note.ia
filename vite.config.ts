import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['@babel/runtime']
    },
    optimizeDeps: {
      include: ['@babel/runtime/helpers/esm/extends']
    },
    build: {
      commonjsOptions: {
        include: [/@babel\/runtime/, /node_modules/]
      }
    },
    define: {
      'process.env': env,
    }
  }
})
