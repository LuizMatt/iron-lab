import app from "./app.js";
import { logger } from "./lib/logger.js";
import { seedIfEmpty } from "./seed.js";

const rawPort = process.env["PORT"];

// 1. Verificação robusta da porta
if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/**
 * Seed do banco de dados na inicialização.
 * Isso garante que o catálogo de Badges (e outros dados iniciais)
 * existam no banco antes do servidor começar a aceitar conexões.
 */
seedIfEmpty()
  .then(() => logger.info("Database seeding checked/completed successfully"))
  .catch((err) => logger.error({ err }, "Seed failed"));

// 2. Inicialização do Servidor Express
// Nota: app.listen no Express não recebe 'err' no primeiro argumento do callback
const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");
});

// Tratamento de erro de inicialização do servidor (porta ocupada, etc)
server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});