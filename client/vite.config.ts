import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 화면(5173)에서 /api 로 보낸 요청을 서버(3001)로 전달합니다.
// 브라우저 입장에서는 같은 주소로 보이므로 쿠키·CORS 설정이 단순해집니다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001"
    }
  }
});
