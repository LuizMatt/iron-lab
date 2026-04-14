# IRONLAB — Documentação da API

> Stack: Express 5 · PostgreSQL · Drizzle ORM · JWT · bcrypt · Zod

Base URL (desenvolvimento): `http://localhost:3001/api`  
Todas as rotas protegidas exigem o header:
```
Authorization: Bearer <token>
```

---

## Autenticação

Tokens JWT gerados no login. Roles disponíveis: `admin`, `professor`, `aluno`.

| Símbolo | Significado |
|---|---|
| 🔓 | Rota pública |
| 🔒 | Qualquer usuário autenticado |
| 🛡️ | Somente `admin` ou `professor` |
| 👑 | Somente `admin` |

---

## Models (Drizzle ORM / PostgreSQL)

### `users`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `text` PK | UUID gerado automaticamente |
| `name` | `varchar(255)` | Nome completo |
| `email` | `varchar(255)` UNIQUE | E-mail (login) |
| `password_hash` | `varchar(255)` | Senha hasheada com bcrypt (custo 12) |
| `role` | `varchar(20)` | `aluno` \| `professor` \| `admin` |
| `avatar_url` | `text` | URL da foto de perfil (opcional) |
| `phone` | `varchar(50)` | Telefone (opcional) |
| `created_at` | `timestamp` | Data de cadastro |

---

### `workouts`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `text` PK | UUID |
| `name` | `varchar(255)` | Nome do treino |
| `description` | `text` | Descrição (opcional) |
| `muscle_groups` | `text` | Grupos musculares, ex: "Peito, Tríceps" |
| `created_by` | `text` | FK → `users.id` |
| `is_custom` | `boolean` | Se foi criado pelo próprio aluno |
| `created_at` | `timestamp` | |

### `exercises`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `text` PK | UUID |
| `workout_id` | `text` | FK → `workouts.id` |
| `name` | `varchar(255)` | Nome do exercício |
| `sets` | `integer` | Séries |
| `reps` | `varchar(50)` | Repetições (ex: "12", "8-12", "falha") |
| `rest_seconds` | `integer` | Descanso em segundos (padrão: 60) |

### `workout_assignments`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `text` PK | UUID |
| `workout_id` | `text` | FK → `workouts.id` |
| `user_id` | `text` | FK → `users.id` |
| `assigned_at` | `timestamp` | Quando foi atribuído |

### `workout_logs`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `text` PK | UUID |
| `user_id` | `text` | FK → `users.id` |
| `workout_id` | `text` | FK → `workouts.id` |
| `completed_at` | `varchar(20)` | Data no formato `YYYY-MM-DD` |

---

### `payments`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `text` PK | UUID |
| `user_id` | `text` | FK → `users.id` |
| `amount` | `decimal(10,2)` | Valor em R$ |
| `status` | `varchar(20)` | `pending` \| `paid` |
| `due_date` | `varchar(20)` | Vencimento `YYYY-MM-DD` |
| `paid_at` | `timestamp` | Quando foi pago (null se pendente) |
| `pix_qr_code` | `text` | URL do QR Code gerado |
| `pix_copy_paste` | `text` | Payload Pix copia e cola |
| `created_at` | `timestamp` | |

### `plans`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `text` PK | UUID |
| `user_id` | `text` | FK → `users.id` |
| `plan_name` | `varchar(100)` | Ex: "Plano Mensal", "Plano Trimestral" |
| `price` | `decimal(10,2)` | Valor R$ |
| `active` | `boolean` | Se o plano está ativo |
| `next_due_date` | `varchar(20)` | Próximo vencimento `YYYY-MM-DD` |

---

## Rotas e Funções dos Controllers

### `/api/health`
| Método | Rota | Acesso | Função |
|---|---|---|---|
| GET | `/api/health` | 🔓 Público | Retorna `{ status: "ok" }` — healthcheck |

---

### `/api/auth`
| Método | Rota | Acesso | Função |
|---|---|---|---|
| POST | `/api/auth/login` | 🔓 Público | Autentica com email+senha, retorna JWT + dados do usuário |
| GET | `/api/auth/me` | 🔒 Autenticado | Retorna os dados do usuário logado a partir do token |

**POST `/api/auth/login` — Body:**
```json
{
  "email": "admin@ironlab.com",
  "password": "admin123"
}
```
**Resposta:**
```json
{
  "token": "eyJ...",
  "user": { "id", "name", "email", "role", "avatarUrl", "phone", "createdAt" }
}
```

---

### `/api/users`
| Método | Rota | Acesso | Função |
|---|---|---|---|
| GET | `/api/users` | 🛡️ Admin/Prof | Lista todos os usuários. Query: `?role=aluno` filtra por papel |
| POST | `/api/users` | 🛡️ Admin/Prof | Cria novo usuário (hasheia senha automaticamente) |
| GET | `/api/users/:id` | 🔒 Autenticado | Retorna um usuário. Aluno só pode ver a si mesmo |
| PUT | `/api/users/:id` | 🔒 Autenticado | Atualiza nome, e-mail, telefone ou avatar. Aluno só edita a si mesmo |
| DELETE | `/api/users/:id` | 👑 Admin | Remove um usuário |

**POST `/api/users` — Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "role": "aluno",
  "phone": "11999999999"
}
```

**PUT `/api/users/:id` — Body (todos opcionais):**
```json
{
  "name": "Novo Nome",
  "email": "novo@email.com",
  "phone": "11988888888",
  "avatarUrl": "https://..."
}
```

---

### `/api/workouts`
| Método | Rota | Acesso | Função |
|---|---|---|---|
| GET | `/api/workouts` | 🔒 Autenticado | Lista treinos. Aluno vê só os atribuídos/criados por ele. Admin/Prof vê todos |
| POST | `/api/workouts` | 🔒 Autenticado | Cria treino com lista de exercícios |
| PUT | `/api/workouts/:id` | 🔒 Autenticado | Atualiza treino + substitui todos os exercícios |
| DELETE | `/api/workouts/:id` | 🔒 Autenticado | Remove treino, exercícios e atribuições |
| POST | `/api/workouts/:id/assign` | 🛡️ Admin/Prof | Atribui treino para um ou mais alunos |
| POST | `/api/workouts/:id/complete` | 🔒 Autenticado | Marca treino como concluído hoje (registra no log de streak) |

**POST `/api/workouts` — Body:**
```json
{
  "name": "Treino A — Peito e Tríceps",
  "description": "Foco em hipertrofia",
  "muscleGroups": "Peito, Tríceps",
  "isCustom": false,
  "exercises": [
    { "name": "Supino Reto", "sets": 4, "reps": "10-12", "restSeconds": 90 },
    { "name": "Tríceps Corda", "sets": 3, "reps": "12", "restSeconds": 60 }
  ]
}
```

**POST `/api/workouts/:id/assign` — Body:**
```json
{ "userIds": ["uuid-aluno-1", "uuid-aluno-2"] }
```

---

### `/api/gamification`
| Método | Rota | Acesso | Função |
|---|---|---|---|
| GET | `/api/gamification/streak` | 🔒 Autenticado | Calcula e retorna o streak do usuário logado |

**Resposta:**
```json
{
  "currentStreak": 5,
  "maxStreak": 14,
  "trainedToday": true,
  "weekDays": [true, false, true, true, true, true, true]
}
```

> `weekDays` = array com os últimos 7 dias (domingo → hoje), `true` se treinou naquele dia.

**Lógica do streak:**
- Conta dias consecutivos com `workout_logs` até hoje (ou ontem, se não treinou hoje)
- `maxStreak` = maior sequência histórica
- `weekDays` = visualização da semana atual

---

### `/api/payments`
| Método | Rota | Acesso | Função |
|---|---|---|---|
| GET | `/api/payments` | 🔒 Autenticado | Aluno: lista seus próprios pagamentos. Admin/Prof: lista todos. Filtros: `?status=pending&userId=xxx` |
| POST | `/api/payments/generate` | 🛡️ Admin/Prof | Gera cobrança Pix para um aluno (QR Code + copia e cola) |
| POST | `/api/payments/webhook` | 🔒 Autenticado | Simula confirmação de pagamento Pix (muda status para `paid`) |

**POST `/api/payments/generate` — Body:**
```json
{
  "userId": "uuid-do-aluno",
  "amount": 99.90,
  "dueDate": "2025-05-10"
}
```

**Resposta:**
```json
{
  "id": "...",
  "userId": "...",
  "userName": "Carlos Oliveira",
  "amount": 99.90,
  "status": "pending",
  "dueDate": "2025-05-10",
  "paidAt": null,
  "pixQrCode": "https://api.qrserver.com/...",
  "pixCopyPaste": "00020126580014BR.GOV.BCB.PIX...",
  "createdAt": "..."
}
```

**POST `/api/payments/webhook` — Body:**
```json
{ "paymentId": "uuid-do-pagamento" }
```

---

### `/api/plans`
| Método | Rota | Acesso | Função |
|---|---|---|---|
| GET | `/api/plans/me` | 🔒 Autenticado | Retorna o plano ativo do usuário logado |

**Resposta:**
```json
{
  "id": "...",
  "userId": "...",
  "planName": "Plano Mensal",
  "price": 99.90,
  "active": true,
  "nextDueDate": "2025-05-10"
}
```

---

## Usuários de demonstração (seed)

| Nome | E-mail | Senha | Role |
|---|---|---|---|
| Admin IRONLAB | admin@ironlab.com | admin123 | admin |
| Prof. Marcos | prof@ironlab.com | prof123 | professor |
| Carlos Oliveira | carlos@email.com | aluno123 | aluno |
| Ana Souza | ana@email.com | aluno123 | aluno |

---

## Middlewares

| Middleware | Arquivo | Descrição |
|---|---|---|
| `authenticate` | `middlewares/auth.ts` | Valida JWT no header `Authorization: Bearer <token>`. Injeta `req.user` com `{ id, email, role }` |
| `requireRole(...roles)` | `middlewares/auth.ts` | Verifica se o role do usuário está na lista de permitidos. Retorna 403 se não |
