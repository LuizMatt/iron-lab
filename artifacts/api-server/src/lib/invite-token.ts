import { randomBytes } from "node:crypto";

const TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const TOKEN_LENGTH = 10;

/**
 * Gera uma string aleatória de 10 caracteres alfanuméricos
 * usando criptografia segura do Node.js.
 */
export function generateInviteToken(): string {
  const bytes = randomBytes(TOKEN_LENGTH);
  return Array.from(bytes)
    .map((b) => TOKEN_CHARS[b % TOKEN_CHARS.length])
    .join("");
}
