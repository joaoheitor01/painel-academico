import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/painel-academico/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["apple-touch-icon.png", "icon.svg"],
      manifest: {
        name: "Dashboard Acadêmico",
        short_name: "Acadêmico",
        description: "Fluxo curricular, horário, frequência e notas — Engenharia de Computação · IFMT",
        lang: "pt-BR",
        theme_color: "#7C3AED",
        background_color: "#F2F1F6",
        display: "standalone",
        orientation: "portrait",
        start_url: ".",
        scope: ".",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Tailwind agora é compilado no build (CSS local) — todos os assets ficam
        // no precache, então o app funciona offline já na primeira instalação.
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
