import { spawnSync } from "node:child_process";

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const env = {
  ...process.env,
  NODE_ENV: "development",
  PORT: process.env.PORT || "3001",
};

run("pnpm", ["run", "build"], { env });
run("node", ["--enable-source-maps", "./dist/index.mjs"], { env });
