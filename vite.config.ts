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
    },
    define: {
      'process.env': env,
    },
    build: {
      rollupOptions: {
        external: [
          '@babel/runtime/helpers/esm/extends',
          'console',
          'process'
        ],
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': ['@radix-ui/react-icons', '@radix-ui/react-dialog'],
            'dnd-vendor': ['@hello-pangea/dnd']
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        '@babel/runtime',
        'react',
        'react-dom',
        '@radix-ui/react-icons',
        '@radix-ui/react-dialog',
        '@hello-pangea/dnd'
      ]
    }
  }
})
