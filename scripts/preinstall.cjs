const fs = require("node:fs");
const path = require("node:path");

const userAgent = process.env.npm_config_user_agent || "";

if (!userAgent.startsWith("pnpm/")) {
  console.error("Use pnpm instead");
  process.exit(1);
}

for (const file of ["package-lock.json", "yarn.lock"]) {
  const target = path.join(process.cwd(), file);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { force: true });
  }
}
