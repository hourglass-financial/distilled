import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });
config({ path: resolve(__dirname, ".env") });

export default {
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 120000,
    // These tests call the shared WorkOS sandbox. Bound file-level concurrency
    // so a local full-suite run does not overwhelm the API rate limit.
    maxWorkers: 4,
  },
  resolve: {
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
    },
  },
};
