import path from "node:path";
import dotenv from "dotenv";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

dotenv.config({ path: ".env.test" });

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
  ],
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.e2e-spec.ts"],
    fileParallelism: false,
    testTimeout: 30000,
    env: {
      NODE_ENV: "test",
    },
  },
});
