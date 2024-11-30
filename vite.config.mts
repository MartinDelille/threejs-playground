import { defineConfig } from "vite";


export default defineConfig(() => {

  return {
    base: "/threejs-playground/",
    build: {
      outDir: "dist",
      assetsDir: "assets"
    },
    server: {
      port: 4096,
    },
  };
});
