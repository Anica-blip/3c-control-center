import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages configuration
  base: '/3c-control-center/', // Replace with your actual repo name
  
  // Development server config
  server: {
    host: "::",
    port: 8080,
  },
  
  plugins: [
    react(),
    // Removed lovable-tagger as it's not needed for GitHub Pages
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Build configuration for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Set to true if you want source maps
  },
}));
