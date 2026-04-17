import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Verificação da URL do banco
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuração da conexão
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Aqui passamos o objeto 'schema' que já contém o index.ts da pasta schema
export const db = drizzle(pool, { schema });

// Re-exportamos tudo da pasta schema para que os outros arquivos 
// consigam importar as tabelas (users, badges, userBadges) direto daqui.
export * from "./schema";