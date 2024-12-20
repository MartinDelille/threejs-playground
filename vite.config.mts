import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    base: "/threejs-playground/",
    build: {
      outDir: "dist",
      assetsDir: "assets",
      rollupOptions: {
        input: {
          main: "index.html",
          binding: "binding/index.html",
          buoyancy: "buoyancy/index.html",
          friction: "friction/index.html",
        },
      },
    },
    server: {
      port: 4096,
    },
  };
});
