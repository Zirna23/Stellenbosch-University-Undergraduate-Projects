import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/hereapi": {
                target: "https://router.hereapi.com",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/hereapi/, ""),
            },
        },
    },
});
