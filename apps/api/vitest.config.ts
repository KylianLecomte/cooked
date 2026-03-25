import path from "node:path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    // Remplace esbuild par SWC pour le support des décorateurs TypeScript
    // et de emitDecoratorMetadata requis par NestJS
    swc.vite({
      module: { type: "es6" },
    }),
  ],
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts"],
    exclude: ["test/**/*", "node_modules/**/*"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.spec.ts", "src/**/*.module.ts", "src/main.ts", "src/instrument.ts"],
    },
  },
});
