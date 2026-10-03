import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // เมื่อไหร่ก็ตามที่ยิง API มาที่ /api ให้ Vite ช่วยส่งต่อไปยัง Laravel ให้อัตโนมัติ
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})