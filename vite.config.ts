import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // GitHub Pages 根路径
  resolve: {
    // 确保只使用一个 React 副本，避免多个 React 实例导致的 Hooks 错误
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 优化构建输出
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
    // 启用源码映射（可选，用于调试）
    sourcemap: false,
    // 压缩配置
    minify: 'esbuild',
    // 目标浏览器
    target: 'es2015',
    // 块大小警告限制
    chunkSizeWarningLimit: 1000,
  },
})
