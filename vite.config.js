import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // 允許區域網路內的所有設備 (如手機輸入 http://192.168.0.157:3001/) 訪問！
    port: 3001,      // 指定 Port 為 3001
    strictPort: false
  }
});
