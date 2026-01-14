import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // 分成開發跟產品兩個路徑
  base: process.env.NODE_ENV === "production" ? "/react-week2/" : "/",
  plugins: [react()],
});
