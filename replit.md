# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: JWT (jsonwebtoken) + bcrypt (salt 12)

## Project: IRONLAB Academia

A complete gym management system built with React + Vite (frontend) and Node.js + Express (backend).

### Features
- Landing page with dark gym aesthetic (lime green #a3e635 accents on #0d0d0d)
- Student dashboard: workouts, gamification streaks, financial tab, profile
- Admin panel: student management, workout assignment, payment generation (Pix mock)
- JWT authentication with role-based access (aluno / professor / admin)
- Seeded with demo data on first start

### Demo Credentials
- Admin: admin@ironlab.com / admin123
- Professor: prof@ironlab.com / prof123
- Aluno 1: carlos@email.com / aluno123
- Aluno 2: ana@email.com / aluno123

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/     # Express API server (JWT auth, all routes)
│   └── ironlab/        # React + Vite frontend
├── lib/
│   ├── api-spec/       # OpenAPI spec + Orval codegen config
│   ├── api-client-react/ # Generated React Query hooks
│   ├── api-zod/        # Generated Zod schemas from OpenAPI
│   └── db/             # Drizzle ORM schema + DB connection
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema (PostgreSQL)

- `users` — alunos, professores, admins
- `workouts` — treinos criados por professor ou aluno
- `exercises` — exercícios dentro de um treino
- `workout_assignments` — atribuição de treino a aluno
- `workout_logs` — registro de treinos concluídos (para streak)
- `payments` — histórico de pagamentos com Pix mock
- `plans` — plano ativo do aluno

## API Routes

- `POST /api/auth/login` — login, retorna JWT
- `GET /api/auth/me` — dados do usuário logado
- `GET/POST /api/users` — listar e criar usuários
- `GET/PUT/DELETE /api/users/:id` — operações individuais
- `GET/POST /api/workouts` — treinos
- `PUT/DELETE /api/workouts/:id`
- `POST /api/workouts/:id/assign` — atribuir a aluno
- `POST /api/workouts/:id/complete` — concluir treino
- `GET /api/gamification/streak` — dados de streak
- `GET /api/payments` — pagamentos
- `POST /api/payments/generate` — gerar cobrança Pix
- `POST /api/payments/webhook` — confirmar pagamento
- `GET /api/plans/me` — plano ativo do aluno

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes
