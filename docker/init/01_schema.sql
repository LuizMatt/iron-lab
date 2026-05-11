-- IRONLAB Academia — Database Schema
-- This file runs automatically on first PostgreSQL startup in Docker

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'aluno',
  avatar_url TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  muscle_groups TEXT,
  created_by TEXT,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sets INTEGER NOT NULL,
  reps VARCHAR(50) NOT NULL,
  rest_seconds INTEGER DEFAULT 60
);

CREATE TABLE IF NOT EXISTS workout_assignments (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  completed_at VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  due_date VARCHAR(20) NOT NULL,
  paid_at TIMESTAMP,
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  next_due_date VARCHAR(20)
);

CREATE TABLE slider_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  image_url TEXT NOT NULL,
  mobile_image_url TEXT,

  alt_text TEXT NOT NULL,
  display_order INTEGER NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  criteria TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_token VARCHAR(20) UNIQUE NOT NULL,
  max_members INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS group_members (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS workout_checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  photo_url VARCHAR(500),
  checked_in_at TIMESTAMP DEFAULT NOW() NOT NULL
);

WITH seed_owner AS (
  SELECT id FROM users LIMIT 1
),
inserted_group AS (
  INSERT INTO groups (
    id,
    name,
    description,
    owner_id,
    invite_token
  )
  SELECT
    md5(random()::text || clock_timestamp()::text),
    'Grupo Teste',
    'Grupo inicial para desenvolvimento',
    seed_owner.id,
    'IRONLAB01'
  FROM seed_owner
  WHERE NOT EXISTS (
    SELECT 1 FROM groups WHERE invite_token = 'IRONLAB01'
  )
  RETURNING id, owner_id
)
INSERT INTO group_members (
  id,
  group_id,
  user_id
)
SELECT
  md5(random()::text || clock_timestamp()::text),
  inserted_group.id,
  inserted_group.owner_id
FROM inserted_group;
