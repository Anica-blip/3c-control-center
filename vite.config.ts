import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: '/',  // ✅ FIXED: Changed from '/3c-control-center/' to '/'
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  css: {
    postcss: false  // ← This disables PostCSS completely
  }
});
